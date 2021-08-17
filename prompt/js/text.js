const text = {
  lang: {
    keys: ["noise", "en", "fr", "de", "es"],
    names: ["noise", "English", "Français", "Deutsch", "Español"]
  },
  noise: {},
  en: {
    wait: "",
    listen: "Please speak in your native language.",
    detect: "I'm listening. Please keep going.",
    success: "I think I heard... <lang>",
    fail: "I can’t understand you.",
    timeout: "I could not recognize your language. Therefore, I show you the English text label."
  },
  fr: {
    wait: "",
    listen: "Veuillez vous exprimer dans votre langue maternelle.",
    detect: "Je vous écoute. S'il vous plaît, continuez.",
    success: "Je crois avoir entendu... <lang>",
    fail: "Je ne peux pas vous comprendre.",
    timeout: "Je n'ai pas pu identifier votre langue. Donc, je vous montre l'étiquette du texte anglais."
  },
  de: {
    wait: "",
    listen: "Bitte sprechen Sie in Ihrer Muttersprache.",
    detect: "Ich bin ganz Ohr. Bitte machen Sie weiter.",
    success: "Ich glaube, ich habe... <lang> gehört",
    fail: "Ich kann Sie nicht verstehen.",
    timeout: "Ich konnte ihre Sprache nicht erkennen. Daher zeige ich ihnen das englische Text Label."
  },
  es: {
    wait: "",
    listen: "Por favor, hable en su lengua materna.",
    detect: "Te escucho. Por favor, sigue adelante.",
    success: "Creo que he oído... <lang>",
    fail: "No puedo entenderlo.",
    timeout: "No he podido reconocer su idioma. Por ello, le muestro la etiqueta de texto en inglés."
  }
}

export default text
