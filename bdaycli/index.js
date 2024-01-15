module.exports = async (cronDetails, context) => {
	const catalyst = require('zcatalyst-sdk-node');
	const admin = require("firebase-admin");
	const serviceAccount = require("./svckey.json");
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		databaseURL: "https://bday-mailer-62c96-default-rtdb.firebaseio.com"
	});

	var db = admin.database();
	var dbRef = db.ref("users");

	const OpenAI = require('openai');
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY
	});
	

	const axios = require('axios');
	const fs = require('fs');
	const path = require('path');

	var flag;

	function getDateNow() {
		const currentDate = new Date();
		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const year = currentDate.getFullYear();
		const formattedDate = `${day}-${month}-${year}`;
		return formattedDate;
	}

	async function thromail(config, catalystApp) {
		console.log("entered thromail");
		let email = catalystApp.email();
		return await email.sendMail(config);
	}

	async function wishGenerate(age) {
		try {
			const chatCompletion = await openai.chat.completions.create({
				messages: [{ role: "user", content: "write a attractive-eyecatching-bdaywishpoem for " + age + "yearold. Atlast Greetings for completing the age. Give this in single paragraph no line break" }],
				model: "gpt-3.5-turbo-1106",
			});
			console.log(chatCompletion);
			console.log(chatCompletion.choices[0].message.content);
			return chatCompletion.choices[0].message.content;
		} catch (error) {
			console.error('Error generating wish:', error.message);
			return "Happy Birthday! May your day be filled with joy, laughter, and unforgettable moments. As you celebrate another year of life, may it bring you success, good health, and endless happiness. Cheers to the incredible person you are and to the wonderful journey ahead. Wishing you a fantastic birthday and an amazing year ahead. Happy "+age+"!";
		}
	}

	async function downloadImage(url, tempDir) {
		try {
			const response = await axios.get(url, { responseType: 'arraybuffer' });
			const fileBuffer = Buffer.from(response.data);
			const tempFilePath = path.join(tempDir, 'image.jpg');
			fs.writeFileSync(tempFilePath, fileBuffer);
			return tempFilePath;
		} catch (error) {
			console.error('Error downloading image:', error.message);
		}
	}

	async function sendmymail(catalystApp, context) {
		var img;

		const fs = require('fs');
		console.log("entered senmymail");
		try {
			const snapshot = await dbRef.once("value");
			const date = getDateNow();
			const dateWoYr = date.slice(0, 5);

			for (const uid of Object.keys(snapshot.val())) {
				const childSnap = snapshot.val()[uid];

				for (const dumid of Object.keys(childSnap)) {
					const relativeList = childSnap[dumid];

					if (typeof relativeList === 'object' && 'name' in relativeList && 'email' in relativeList && 'birth' in relativeList) {
						if (relativeList.birth.slice(0, 5) == dateWoYr) {
							console.log("some person bday");
							let age = date.slice(6, 10) - relativeList.birth.slice(6, 10);
							console.log(age, "agethisis");
							let name = relativeList.name.charAt(0).toUpperCase() + relativeList.name.slice(1);

							if ('url' in relativeList) {
								const tempDir = require('os').tmpdir();
								await downloadImage(relativeList.url, tempDir)
									.then((tempFilePath) => {
										img = fs.createReadStream(tempFilePath);
									})
									.catch((error) => {
										console.error('Error:', error.message);
									});
							} else {
								img = fs.createReadStream('img.jpg');
							}

							await wishGenerate(age).then(async (wishpoem) => {
								console.log("entered mail config");
								let config = {
									from_email: 'guruprasath.m@zohomail.in',
									to_email: relativeList.email,
									bcc: 'bdaymailer@googlegroups.com',
									reply_to: childSnap.email,
									subject: "🎉 Happy Birthday " + name + "! 🎂",
									content: "Dear " + name + ",\n" + wishpoem,
									attachments: [img]
								};

								console.log("abv thromail");
								await thromail(config, catalystApp).then(async (m) => {
									const histRef = db.ref(`users/${uid}/${dumid}`);
									await histRef.update({
										lastupdated: date
									});
									console.log(m, "success");
								}).catch((e) => {
									flag = "fail";
									console.log(e, "errorpromise");
								});
								console.log("blw thromail");
								console.log(relativeList.email, "status");
							});
						} else {
							console.log("nobday");
						}
					}
				}
			}

			//setTimeout(() => {

			//}, 5 * 60 * 1000);
		} catch (error) {
			console.error('Error in sendmymail:', error.message);
			context.closeWithFailure();
		}
	}

	const catalystApp = catalyst.initialize(context);
	console.log("above sendmymail");
	await sendmymail(catalystApp, context);
	if (flag === "fail") {
		context.closeWithFailure();
	} else {
		context.closeWithSuccess();
	}
	console.log("below sendmymail");
};
