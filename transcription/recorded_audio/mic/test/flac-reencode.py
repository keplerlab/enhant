# This program is released under the following MIT license:

# Copyright 2016-2019 Jan-Philip Gehrcke (https://gehrcke.de)

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

"""
FLAC audio files may have been encoded with errors (using unusual or even
erroneous parameters) that can trip up some FLAC stream decoders whereas the
audio data is not actually damanged. In these cases, re-encoding the audio data
with proper tooling repairs the audio file. The repaired file can then be played
without problems by a program that was unable to play or seek within the
original.

Specifically, I have seen the following behavior for some FLAC audio files
downloaded from Bandcamp: when played in Traktor (Native Instruments, versions
2.10.x) the playback might stop when quickly seeking through the file. For every
affected file the problem went away after re-encoding the audio stream using
(lib)flac.

This is how such a FLAC stream encoding error manifests itself when the flac
program/library comes across it:

    <filename>: ERROR got FLAC__STREAM_DECODER_ERROR_STATUS_LOST_SYNC while decoding FLAC input

This is how such a FLAC stream encoding error manifests itself when ffmpeg comes
across it:

    ...
    Stream mapping:
      Stream #0:0 -> #0:0 (flac (native) -> flac (native))
    Press [q] to stop, [?] for help
    [flac @ 0000000000618560] invalid sync code
    [flac @ 0000000000618560] invalid frame header
    [flac @ 0000000000618560] decode_frame() failed
    Error while decoding stream #0:0: Invalid data found when processing input
    size=   17431kB time=00:02:13.42 bitrate=1070.3kbits/s speed= 267x
    ...


After repairing, the corresponding output looks like that:

    ...
    Stream mapping:
      Stream #0:0 -> #0:0 (flac (native) -> flac (native))
    Press [q] to stop, [?] for help
    size=   15944kB time=00:02:03.61 bitrate=1056.6kbits/s speed= 247x
    ...


The re-encoding method used by this program (via the `flac` program) fully
retains all metadata in a FLAC file, including embedded images. I have confirmed
this with the `metaflac` program (interestingly, re-encoding using ffmpeg would
not retain all data).

For the decoding errors that this re-encoding method is supposed to fix,
notably, the audio data is fully retained. That is, the problem itself does not
mean that the audio data is damaged. The re-encoding simply extracts the good
information and re-writes it in a more compliant way. I have confirmed this with
metaflac by looking at the MD5 checksum of the audio data of an affected FLAC
audio file:

Metaflac STREAMINFO output for the flawed FLAC file:

    METADATA block #0
      type: 0 (STREAMINFO)
      is last: false
      length: 34
      minimum blocksize: 4096 samples
      maximum blocksize: 4096 samples
      minimum framesize: 7585 bytes
      maximum framesize: 20347 bytes
      sample_rate: 44100 Hz
      channels: 2
      bits-per-sample: 24
      total samples: 26226176
      MD5 signature: cd0d4691df20a8060312977cc7af64d9

Metaflac STREAMINFO output for the corresponding repaired (re-encoded) file:

    METADATA block #0
      type: 0 (STREAMINFO)
      is last: false
      length: 34
      minimum blocksize: 1152 samples
      maximum blocksize: 1152 samples
      minimum framesize: 2046 bytes
      maximum framesize: 6092 bytes
      sample_rate: 44100 Hz
      channels: 2
      bits-per-sample: 24
      total samples: 26226176
      MD5 signature: cd0d4691df20a8060312977cc7af64d9

The checksum, i.e. the audio data, remained the same, bit by bit. Notably, the
maximum frame size and a few other details changed, indicating that the original
file was encoded with unusual parameters that can trip up decoders.

This program uses the official `flac` program which is documented at
https://xiph.org/flac/documentation_tools_flac.html
"""

import datetime
import logging
import os
import platform
import random
import shutil
import string
import subprocess
import sys


WINDOWS = platform.system() == 'Windows'


# Hand this to `logging`, but also open this file for redirecting stdout and
# stderr of the `flac` child process into it.
LOGFILE_PATH = 'reencode-flacs-' + datetime.datetime.now().strftime("%Y%m%d-%H%M%S") + '.log'

log = logging.getLogger()


def configure_logging():
    log.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s')
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    fh = logging.FileHandler(LOGFILE_PATH, encoding='utf-8')
    fh.setFormatter(formatter)
    log.addHandler(ch)
    log.addHandler(fh)


def rnd_string(N):
    return ''.join(random.choices(
        string.ascii_uppercase + string.digits, k=N))


def flush_logging_handlers():
    for handler in log.handlers:
        handler.flush()


def gen_relative_input_filepaths(original_files_toplevel_directory):
    # It is critical that the filepaths are relative paths, relative
    # to the current working directory.
    for dirpath, dirnames, filenames in os.walk('.'):
        if original_files_toplevel_directory in dirpath:
            # Do not discover files that have previously been archived / backed
            # up by this very program. This is brittle...
            continue
        for filename in filenames:
            if filename.endswith('.flac'):
                yield os.path.join(dirpath, filename)


def process_flac_file(
        flac_executable_path,
        relative_input_filepath,
        original_files_toplevel_directory):

    log.info('Process file: %s', relative_input_filepath)

    relative_input_filepath_bkp = os.path.join(
        original_files_toplevel_directory,
        relative_input_filepath
    )

    # Shortcut: was the file already processed in a previous run?
    # Skip it then!
    if os.path.exists(relative_input_filepath_bkp):
        log.info(
            'Skipping file, backup already exists: %s',
            relative_input_filepath_bkp
        )
        return

    # Make `flac` write output file to a temp file with random file name in the
    # same directory as the original file.
    output_filepath_suffix = '%s.reenc.flac' % (rnd_string(6), )
    output_filepath_tmp = relative_input_filepath + output_filepath_suffix

    flac_cmd = [
        flac_executable_path,
        '--verify',
        '--compression-level-0',
        '--decode-through-errors',
        '--preserve-modtime',
        '--silent',
        '-o',
        output_filepath_tmp,
        relative_input_filepath
    ]

    log.info('Run command: %s', ' '.join(flac_cmd))

    # Make sure that the logging file handler flushes its buffers, so that the
    # child process stdout/stderr does not interleave with the log output.
    flush_logging_handlers()

    # Run child process and redirect its stdout and stderr to the log file.
    # Opening the file in append mode after the flush above and guaranteeing to
    # close the file straight after child process termination are important for
    # keeping this program's log output and stdout/stderr of the child process
    # in a well-defined order in the logfile.
    with open(LOGFILE_PATH, 'ab') as logfile:
        sp = subprocess.run(
            flac_cmd,
            stdout=logfile,
            stderr=subprocess.STDOUT
            )
    log.info('Command exit code: %s', sp.returncode)

    if sp.returncode != 0:
        log.error('flac cmd returned non-zero, inspect log file')
        log.info('attempt to remove temp file')
        try:
            os.remove(output_filepath_tmp)
        except Exception as e:
            log.error('could not remove: %s', e)
        log.error('Abort. Please inspect situation, maybe re-run.')
        sys.exit(1)

    # By the way, swapping files reliably is not trivial.
    # https://unix.stackexchange.com/questions/32894/best-way-to-swap-filenames

    # Success? Move the original to original_files_toplevel_directory.
    # Move freshly created file to original file path.
    try:
        movefile(relative_input_filepath, relative_input_filepath_bkp)
    except Exception as e:
        try:
            # The original was not moved, so keep it and remove the
            # re-encoded file.
            os.remove(output_filepath_tmp)
        except OSError:
            pass
        raise
    movefile(output_filepath_tmp, relative_input_filepath)


def movefile(src, dst):
    # Create directory(ies) if not yet existing.

    if os.path.exists(dst):
        raise Exception('Was not expected to exist: %s' % (dst, ))

    # https://bugs.python.org/issue18199#msg191121
    # Well, the problem, as you point out, is that "\\?\" only works with
    # absolute paths, but the stdlib currently works with both absolute and
    # relative paths. The only reasonable solution right now is to prepend the
    # "\\?\" prefix yourself (after having resolved the path to absolute).
    if WINDOWS:
        # log.debug('windows src dst')
        src = "\\\\?\\" + os.path.abspath(src)
        dst = "\\\\?\\" + os.path.abspath(dst)

    dst_dir, _ = os.path.split(dst)
    if dst_dir and not os.path.exists(dst_dir):
        log.debug('Create directory %s', dst_dir)
        os.makedirs(dst_dir, exist_ok=True)

    log.debug('Move `%s` to `%s`', src, dst)
    shutil.move(src, dst)


def main():
    log.info('Starting up. Logfile path: %s', LOGFILE_PATH)
    flac_executable_path = shutil.which('flac')
    log.info('Discovered FLAC executable: %s', flac_executable_path)

    # Relative to the current working directory create a new directory for
    # storing the tree of original files.
    original_files_toplevel_directory = 'flac-repair-original-files'
    os.makedirs(original_files_toplevel_directory, exist_ok=True)

    relative_input_filepaths = list(
        gen_relative_input_filepaths(
            original_files_toplevel_directory))

    discovered_files = '\n    '.join(relative_input_filepaths)
    log.info('Discovered FLAC files:\n    %s', discovered_files)

    for relative_input_filepath in relative_input_filepaths:
        process_flac_file(
            flac_executable_path,
            relative_input_filepath,
            original_files_toplevel_directory
        )

    log.info('All files processed. Terminate.')


if __name__ == "__main__":
    configure_logging()
    main()