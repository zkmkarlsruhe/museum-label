// supported languages and localized prompt texts
const text = {
  lang: {
    keys: ["noise", "zh", "en", "fr", "de", "it", "ru", "es"],
    names: ["noise", "Zhōngwén", "English", "Français", "Deutsch", "Italiano", "Русский", "Español"]
  },
  locales: {
    noise: {
      state: {},
      lang: {
        names: []
      }
    },
    zh: {
      state: {
        wait: "",
        listen: "请用您的母语发言。",
        detect: "我在听。请继续前进。",
        success: "我想我听说... <lang>",
        fail: "我无法理解你。",
        timeout: "我无法识别你的语言。因此，我向你展示英文文本标签。"
      },
      lang: {
        names: ["", "中文", "英语", "法国", "德国", "意大利语", "俄罗斯", "西班牙"]
      }
    },
    en: {
      state: {
        wait: "",
        listen: "Please speak in your native language.",
        detect: "I'm listening. Please keep going.",
        success: "I think I heard... <lang>",
        fail: "I can’t understand you.",
        timeout: "I could not recognize your language. Therefore, I show you the English text label."
      },
      lang: {
        names: ["", "Chinese", "English", "French", "German", "Italian", "Russian", "Spanish"]
      }
    },
    fr: {
      state: {
        wait: "",
        listen: "Veuillez vous exprimer dans votre langue maternelle.",
        detect: "Je vous écoute. S'il vous plaît, continuez.",
        success: "Je crois avoir entendu... <lang>",
        fail: "Je ne peux pas vous comprendre.",
        timeout: "Je n'ai pas pu identifier votre langue. Donc, je vous montre l'étiquette du texte anglais."
      },
      lang: {
        names: ["", "Chinois", "Anglais", "Français", "Allemand", "Italien", "Russe", "Espagnol"]
      }
    },
    de: {
      state: {
        wait: "",
        listen: "Bitte sprechen Sie in Ihrer Muttersprache.",
        detect: "Ich bin ganz Ohr. Bitte machen Sie weiter.",
        success: "Ich glaube, ich habe... <lang> gehört",
        fail: "Ich kann Sie nicht verstehen.",
        timeout: "Ich konnte ihre Sprache nicht erkennen. Daher zeige ich ihnen das englische Text Label."
      },
      lang: {
        names: ["", "Chinesisch", "Englisch", "Französisch", "Deutsch", "Italienisch", "Russisch", "Spanisch"]
      }
    },
    it: {
      state: {
        wait: "",
        listen: "Per favore, parlate nella vostra lingua madre.",
        detect: "Sto ascoltando. Per favore, continua.",
        success: "Credo di aver sentito... <lang>",
        fail: "Non riesco a capirti.",
        timeout: "Non ho potuto riconoscere la vostra lingua. Pertanto, vi mostro l'etichetta del testo inglese."
      },
      lang: {
        names: ["", "Cinese", "Inglese", "Francese", "Tedesco", "Italiano", "Russo", "Spagnolo"]
      }
    },
    ru: {
      state: {
        wait: "",
        listen: "Пожалуйста, говорите на своем родном языке.",
        detect: "Я слушаю. Пожалуйста, продолжайте.",
        success: "Кажется, я слышал... <lang>",
        fail: "Я не могу тебя понять.",
        timeout: "Я не смог распознать ваш язык. Поэтому я показываю вам этикетку с английским текстом."
      },
      lang: {
        names: ["", "Китайский", "Английский", "Французский", "Немецкий", "Итальянский", "Русский", "Испанский"]
      }
    },
    es: {
      state: {
        wait: "",
        listen: "Por favor, hable en su lengua materna.",
        detect: "Te escucho. Por favor, sigue adelante.",
        success: "Creo que he oído... <lang>",
        fail: "No puedo entenderlo.",
        timeout: "No he podido reconocer su idioma. Por ello, le muestro la etiqueta de texto en inglés."
      },
      lang: {
        names: ["", "Chino", "Inglés", "Francés", "Alemán", "Italiano", "Ruso", "Español"]
      }
    }
  }
}

export default text
