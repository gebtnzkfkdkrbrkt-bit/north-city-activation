const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// حل مشكلة الـ X-Forwarded-For على Render
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// قراءة ملف الواجهة الرئيسي index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// إعداد بوت ديسكورد
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// استقبال طلبات التفعيل من الموقع وإرسالها للديسكورد
app.post('/api/applications', async (req, res) => {
  try {
    const { discordName, gameName, answers } = req.body;

    if (!discordName || !gameName || !answers) {
      return res.status(400).json({ error: 'يرجى تعبئة كافة الحقول المطلوبة.' });
    }

    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId) {
      return res.status(500).json({ error: 'معرف قناة ديسكورد غير مضبوط في السيرفر.' });
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      return res.status(500).json({ error: 'لم يتم العثور على قناة ديسكورد المحددة.' });
    }

    const applicationId = Math.floor(100000 + Math.random() * 900000);

    const embed = new EmbedBuilder()
      .setTitle('📋 طلب تفعيل جديد - North City RP')
      .setColor(0x3b82f6)
      .addFields(
        { name: 'رقم الطلب', value: `#${applicationId}`, inline: true },
        { name: 'حساب Discord', value: discordName, inline: true },
        { name: 'اسم الشخصية (IC)', value: gameName, inline: true },
        { name: 'عدد الإجابات', value: `${answers.length} سؤالاً`, inline: false }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    res.status(200).json({ 
      message: 'تم إرسال طلب التفعيل بنجاح إلى الإدارة!', 
      applicationId: applicationId 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب في السيرفر.' });
  }
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (TOKEN) {
  client.login(TOKEN).catch(err => console.error('Discord login error:', err));
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
