module.exports = (cronDetails, context) => {
	
	const catalyst = require('zcatalyst-sdk-node');

	const firebaseConfig = {
		apiKey: "AIzaSyD27EFMpChpPEoTdwoN61TOzm9aU39K7f0",
		authDomain: "bday-mailer-62c96.firebaseapp.com",
		databaseURL: "https://bday-mailer-62c96-default-rtdb.firebaseio.com",
		projectId: "bday-mailer-62c96",
		storageBucket: "bday-mailer-62c96.appspot.com",
		messagingSenderId: "767480013407",
		appId: "1:767480013407:web:201a8d7b38a0f7c4c971ea",
		measurementId: "G-YSG0R407MB"
	  };

	const { initializeApp } = require('firebase/app');
	const { getDatabase, ref, get } = require('firebase/database');
	const OpenAI = require('openai');
	const apikey = "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";
	const openai = new OpenAI({
		apiKey: apikey
	});
	
	

	

	const app = initializeApp(firebaseConfig);
	const db = getDatabase(app);
	const dbRef = ref(db, "mailerlist");

	function getDateNow() {
		const currentDate = new Date();
	  
		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
		const year = currentDate.getFullYear();
	  
		const formattedDate = `${day}-${month}-${year}`;
	  
		return formattedDate;
	  }



	async function thromail(config, catalystApp){
		console.log("entered thromail")
		let email = catalystApp.email();
		let mailPromise = await email.sendMail(config);
		return mailPromise;
	}


	async function wishGenerate(age){
		const chatCompletion = await openai.chat.completions.create({
			messages: [{ role: "user", content: "write a attractive-eyecatching-bdaywishpoem for "+ age +"yearold. Atlast Greetings for completing the age. Give this in single paragraph no line break" }],
			model: "gpt-3.5-turbo-1106",
		});
		
		console.log(chatCompletion);
		

		
		// setTimeout(() => {
		// 	console.log("5sec");
		// }, 5000);

		// if(chatCompletion == null){
		// 	setTimeout(() => {
		// 		console.log("10sec");
		// 	}, 5000);
		// }
		// if(chatCompletion == null){
		// 	setTimeout(() => {
		// 		console.log("20sec");
		// 	}, 10000);
		// }
		// if(chatCompletion == null){
		// 	setTimeout(() => {
		// 		console.log("30sec");
		// 	}, 10000);
		// }

		
		console.log(chatCompletion.choices[0].message.content);
		return chatCompletion.choices[0].message.content;
		
	}

	
	async function sendmymail(catalystApp, context){
		


		const fs = require('fs');

		console.log("entered senmymail")
		await get(dbRef).then((snapshot) => {
			console.log("Entered get")
			//const data = [];
			const date = getDateNow();
			const dateWoYr = date.slice(0, 5);
			console.log(dateWoYr);
			snapshot.forEach((childSnapshot) => {
			console.log("entered foreach")
			  const childData = childSnapshot.val();
			  console.log("after child snap")
			  if (typeof childData === 'object' && 'name' in childData && 'email' in childData && 'birth' in childData && 'senderemail' in childData) {
				//data.push({ ...childData, id: childKey, sno: sno });
				console.log("entered data validation")
				console.log(childData.birth.slice(0,5));


				if(childData.birth.slice(0,5) == dateWoYr){
					console.log("some person bday")
					//let email = catalystApp.email();
					let age = date.slice(6 , 10) - childData.birth.slice(6, 10);


					console.log(age, "agethisis");
					let name = childData.name.charAt(0).toUpperCase() + childData.name.slice(1);
					//chatgpt for gen bday wish


					wishGenerate(age).then((wishpoem) =>{
						let config = { 
							from_email: 'guruprasath.m@zohomail.in',
							to_email: childData.email,
							bcc: 'bdaymailer@googlegroups.com',
							reply_to: childData.senderemail,
							subject: "🎉 Happy Birthday " + name + "! 🎂", 
							content: "Dear " + name + ", " + wishpoem,
							attachments: [fs.createReadStream('img.jpg')]
						};
	
						console.log("abv thromail")
						let mailPromise = thromail(config, catalystApp);
						console.log("blw thromail")
						console.log(childData.email, "status");
						mailPromise.then((m)=>{console.log(m, "success");}).catch((e)=>{console.log(e, "errorpromise")})

					} )
				


				}
				else{console.log("nobday");}


			  } 
			  

			}

			);
			setTimeout(() => {
				context.closeWithSuccess();
			}, 50000);
		
		  });
		 
		 


	
}
			 
	
	
	
	
	
	
	
	
	
	

		// let cronParams = cronDetails.getCronParam("name");
		// if(typeof cronParams === 'undefined'){
		// 	cronParams = 'DefaultName';
		// }
		const catalystApp = catalyst.initialize(context);
		console.log("above sendmymail")
		sendmymail(catalystApp, context);
		console.log("below sendmymail")
		//Get Segment instance with segment ID (If no ID is given, Default segment is used)
		//let segment = catalystApp.cache().segment();
		//Insert Cache using put by passing the key-value pair.
		// segment.put("Name", cronParams.toString())
		// 	.then((cache) => {
		// 		console.log("\nInserted Cache : " + JSON.stringify(cache));
		// 		segment.get("Name").then((result) => {
		// 			console.log("Got value : " + result);
		// 			context.closeWithSuccess();
		// 		});
		// 	})
		// 	.catch((err) => {
		// 		console.log(err);
		// 		context.closeWithFailure();
		// 	});
	
	}