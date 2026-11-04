const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// حل مشكلة X-Forwarded-For ومكتبة express-rate-limit على Render
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد بوت ديسكورد
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

const ACCEPT_CHANNEL_ID = process.env.ACCEPT_CHANNEL_ID;

// صفحة استقبال التقديم من الموقع
app.post('/submit', async (req, res) => {
    try {
        const { username, age, experience } = req.body;
        
        const channel = await client.channels.fetch(ACCEPT_CHANNEL_ID);
        if (!channel) {
            return res.status(400).json({ success: false, message: 'لم يتم العثور على قناة قبول التفعيل!' });
        }

        const embed = new EmbedBuilder()
            .setTitle('📝 تقديم تفعيل جديد - NORTH CITY')
            .setColor('#8B0000')
            .addFields(
                { name: '👤 اسم اللاعب', value: username || 'غير محدد', inline: true },
                { name: '🎂 العمر', value: age || 'غير محدد', inline: true },
                { name: '💼 الخبرة / الخلفية', value: experience || 'لا توجد' }
            )
            .setFooter({ text: `Submitted by ${username || 'User'} • NORTH CITY System` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('accept_app')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('reject_app')
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        await channel.send({ embeds: [embed], components: [row] });

        res.status(200).json({ success: true, message: 'تم إرسال التقديم بنجاح إلى ديسكورد!' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء إرسال التقديم.' });
    }
});

// التفاعل مع الأزرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'accept_app') {
        await interaction.reply({ 
            content: `✅ **تم قبول التقديم بنجاح بواسطة:** ${interaction.user.tag}`, 
            ephemeral: false 
        });
    } else if (interaction.customId === 'reject_app') {
        await interaction.reply({ 
            content: `❌ **تم رفض التقديم بواسطة:** ${interaction.user.tag}`, 
            ephemeral: false 
        });
    }
});

client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});