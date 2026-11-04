require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/", rateLimit({ windowMs: 10 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }));

const QUESTIONS = [
  { q: "ما المقصود بمصطلح Fear RP؟", a: ["التصرف وكأن شخصيتك تخاف على حياتها عند وجود تهديد واقعي", "الهروب من كل موقف", "إطلاق النار دون سبب"], correct: 0 },
  { q: "ما المقصود بـ RDM؟", a: ["دهس المركبات", "قتل لاعب دون سبب أو سيناريو RP", "استخدام الهاتف"], correct: 1 },
  { q: "ما المقصود بـ VDM؟", a: ["استخدام المركبة لقتل أو إيذاء اللاعبين دون RP", "بيع المركبات", "قيادة مركبة حكومية"], correct: 0 },
  { q: "ما معنى Meta Gaming؟", a: ["إصلاح المركبة", "استخدام معلومات من خارج اللعبة داخل RP", "التحدث مع الإدارة"], correct: 1 },
  { q: "ما معنى Power Gaming؟", a: ["فرض أفعال غير منطقية أو حرمان الآخرين من فرصة التفاعل", "شراء منزل", "الالتزام بالوظيفة"], correct: 0 },
  { q: "إذا تعرضت لحادث قوي داخل اللعبة، ماذا تفعل؟", a: ["تتجاهل الحادث دائماً", "تكمل وكأن شيئاً لم يحدث", "تتفاعل مع الحادث بما يناسب الواقعية"], correct: 2 },
  { q: "هل يجوز الخروج من اللعبة لتجنب سيناريو قائم؟", a: ["نعم دائماً", "لا، يجب إكمال السيناريو أو إبلاغ الإدارة عند وجود مشكلة حقيقية", "فقط عند الخسارة"], correct: 1 },
  { q: "ما التصرف الصحيح عند وجود خلاف مع لاعب؟", a: ["تبدأ السب والشتم", "تخرب السيناريو", "تكمل RP وتستخدم نظام الشكاوى عند الحاجة"], correct: 2 },
  { q: "هل يسمح باستخدام معلومات Discord لمعرفة موقع لاعب داخل RP؟", a: ["لا، هذا Meta Gaming", "نعم في كل الحالات", "نعم إذا كان صديقك"], correct: 0 },
  { q: "ماذا تفعل إذا طلب منك لاعب التوقف عن سيناريو بسبب خلل تقني؟", a: ["تستغل الموقف", "تتعاون وتوثق المشكلة ثم تتواصل مع الإدارة", "تتهمه مباشرة"], correct: 1 },
  { q: "ما معنى Combat Logging؟", a: ["تسجيل مقطع", "تغيير السلاح", "الخروج من اللعبة أثناء موقف قتالي أو سيناريو لتجنب نتائجه"], correct: 2 },
  { q: "هل يحق لك إجبار لاعب على تنفيذ فعل دون منحه فرصة للرد؟", a: ["لا، يجب ترك فرصة تفاعل عادلة", "نعم دائماً", "فقط في الأماكن العامة"], correct: 0 },
  { q: "كيف تتصرف عند توقيفك من جهة أمنية داخل RP؟", a: ["تتجاهلهم وتغادر", "تتفاعل مع الموقف وتحافظ على الواقعية", "تخرج من اللعبة"], correct: 1 },
  { q: "هل يجوز استخدام ثغرة للحصول على أموال أو ممتلكات؟", a: ["نعم إذا لم يلاحظ أحد", "نعم مرة واحدة", "لا، ويجب الإبلاغ عنها للإدارة"], correct: 2 },
  { q: "ما التصرف الصحيح إذا شاهدت مخالفة واضحة؟", a: ["ترد بالمخالفة نفسها", "توثقها وتقديم بلاغ للإدارة", "تنشر بيانات اللاعب"], correct: 1 },
  { q: "هل يجب احترام حدود الشخصية وعدم خلط الخلافات الشخصية مع RP؟", a: ["نعم", "لا", "حسب اللاعب"], correct: 0 },
  { q: "ما المقصود بـ NLR (إن كان معمولاً به في قوانين المدينة)؟", a: ["قاعدة عدم العودة للموقف/الموقع بعد الإقصاء وفق مدة وقواعد السيرفر", "قانون المرور", "نظام الوظائف"], correct: 0 },
  { q: "هل يسمح باستعمال برامج الغش أو التعديلات التي تمنح أفضلية؟", a: ["نعم في السر", "لا، يمنع استعمالها", "فقط خارج المدينة"], correct: 1 },
  { q: "إذا لم تفهم قانوناً معيناً، ماذا تفعل؟", a: ["تخمن وتخالف", "تسأل الإدارة أو تقرأ القانون قبل التصرف", "تطلب من لاعب آخر مخالفة القانون"], correct: 1 },
  { q: "ما أهم أساس في لعب Roleplay؟", a: ["الفوز بأي طريقة", "إزعاج اللاعبين", "بناء شخصية واقعية واحترام متعة الجميع والقوانين"], correct: 2 }
];

app.post("/api/applications", async (req, res) => {
  try {
    const { discordName, gameName, answers } = req.body || {};
    if (typeof discordName !== "string" || discordName.trim().length < 2 || discordName.length > 80)
      return res.status(400).json({ error: "يرجى كتابة اسم Discord بشكل صحيح." });
    if (typeof gameName !== "string" || gameName.trim().length < 2 || gameName.length > 40)
      return res.status(400).json({ error: "يرجى كتابة اسم حساب اللعبة بشكل صحيح." });
    if (!Array.isArray(answers) || answers.length !== QUESTIONS.length || answers.some((v, i) => !Number.isInteger(v) || v < 0 || v > 2))
      return res.status(400).json({ error: "يرجى الإجابة عن جميع الأسئلة." });
    if (!WEBHOOK || !WEBHOOK.startsWith("https://discord.com/api/webhooks/"))
      return res.status(503).json({ error: "نظام استقبال الطلبات غير مفعّل حالياً. تواصل مع الإدارة." });

    const score = answers.reduce((sum, answer, i) => sum + (answer === QUESTIONS[i].correct ? 1 : 0), 0);
    const applicationId = "NC-" + Date.now().toString(36).toUpperCase();

    const midPoint = Math.ceil(QUESTIONS.length / 2);
    const firstHalf = QUESTIONS.slice(0, midPoint).map((item, i) => 
      `${i + 1}. ${answers[i] === item.correct ? "✅" : "❌"}`
    ).join(" | ");

    const secondHalf = QUESTIONS.slice(midPoint).map((item, i) => {
      const idx = i + midPoint;
      return `${idx + 1}. ${answers[idx] === item.correct ? "✅" : "❌"}`;
    }).join(" | ");

    const payload = {
      username: "NORTH CITY | Activation",
      embeds: [{
        title: "📩 طلب تفعيل جديد",
        color: 3447003,
        description: "تم استلام طلب جديد ويحتاج إلى مراجعة الإدارة.",
        fields: [
          { name: "رقم الطلب", value: applicationId, inline: true },
          { name: "النتيجة", value: `${score}/20`, inline: true },
          { name: "اسم Discord", value: discordName.trim(), inline: true },
          { name: "اسم حساب اللعبة", value: gameName.trim(), inline: true },
          { name: "الإجابات (1-10)", value: firstHalf, inline: false },
          { name: "الإجابات (11-20)", value: secondHalf, inline: false },
          { name: "الحالة", value: "🕒 بانتظار مراجعة الإدارة", inline: false }
        ],
        footer: { text: "NORTH CITY RP • Activation System" },
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Discord webhook returned", response.status, await response.text());
      return res.status(502).json({ error: "تعذر إرسال الطلب إلى Discord. حاول لاحقاً." });
    }
    res.json({ ok: true, applicationId, score, message: "تم إرسال طلبك للإدارة بنجاح." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ غير متوقع. حاول مرة أخرى." });
  }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`NORTH CITY activation running on port ${PORT}`));
