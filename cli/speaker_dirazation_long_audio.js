// Imports the Google Cloud client library
const speech = require('@google-cloud/speech').v1p1beta1;

// Creates a client
const client = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const gcsUri = 'gs://enhant-testing/LLP_test.wav';
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';
const speakerDiarizationConfig = 
{
    "enableSpeakerDiarization": true,
    "minSpeakerCount": 1,
    "maxSpeakerCount": 10
    //"speakerTag": integer
}

const config = {

  encoding: encoding,
  sampleRateHertz: sampleRateHertz,
  enableSpeakerDiarization: true,
  enableAutomaticPunctuation: true,
  languageCode: languageCode,
  SpeakerDiarizationConfig:speakerDiarizationConfig,
  //model: 'phone_call',
  //diarizationSpeakerCount: 2,

};

const audio = {
  uri: gcsUri,
};

const request = {
  config: config,
  audio: audio,
};



(async () => { 
    const [operation] = await client.longRunningRecognize(request);
    // Get a Promise representation of the final result of the job
    const [response] = await operation.promise();
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
    //console.log(`response.results: ${response.results}`);

    console.log('Speaker Diarization:');

    const result = response.results[response.results.length - 1];
    //console.log(`wordsInfo: ${JSON.stringify(wordsInfo)}`);

    //console.log(`result: ${JSON.stringify(result)}`);
    const wordsInfo = result.alternatives[0].words;
    console.log(`wordsInfo: ${JSON.stringify(wordsInfo)}`);

    // Note: The transcript within each result is separate and sequential per result.
    // However, the words list within an alternative includes all the words
    // from all the results thus far. Thus, to get all the words with speaker
    // tags, you only have to take the words list from the last result:
    //wordsInfo.forEach(a =>
    //console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
    //);
 })()