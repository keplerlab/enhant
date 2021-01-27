const CONFIG = {
    transcription: {
        port: 1111,
        ip: "127.0.0.1",
        lang_default: "en-US"
    },
    power_mode: false,
    backend: {
        port: 8000,
        ip: "127.0.0.1"
    },
    bookmark: {
        transcription_time_in_sec: 10
    },
    voice: {
        threshold: 0.70
    },
    default_whitelisted_urls: [
        "http://teams.microsoft.com",
        "http://zoom.us",
        "http://meet.jit.si",
        "https://meet.google.com"
    ]
}