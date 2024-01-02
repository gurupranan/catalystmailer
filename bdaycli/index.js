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
	const { getDatabase, ref, onValue, get } = require('firebase/database');
	
	
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


	
	async function sendmymail(catalystApp, context){
		console.log("entered senmymail")
		await get(dbRef).then( (snapshot) => {
			console.log("Entered get")
			//const data = [];
			const date = getDateNow();
			const dateWoYr = date.slice(0, 5);
			console.log(dateWoYr);
			snapshot.forEach((childSnapshot) => {
				console.log("entered foreach")
			  //sno = sno + 1;
			  //const childKey = childSnapshot.key;
			  const childData = childSnapshot.val();
			  console.log("after child snap")
			  if (typeof childData === 'object' && 'name' in childData && 'email' in childData && 'birth' in childData) {
				//data.push({ ...childData, id: childKey, sno: sno });
				console.log("entered data validation")
				console.log(childData.birth.slice(0,5));
				if(childData.birth.slice(0,5) == dateWoYr){
					console.log("some person bday")
					//let email = catalystApp.email();
					let config = { 
						from_email: 'guruprasath.m@zohomail.in',
						to_email: childData.email,
						cc: childData.email,
						bcc: 'bdaymailer@googlegroups.com',
						reply_to: 'guruprasath.m@zohomail.in',
						subject: 'Happy birthday!', 
						content: "Hello,We're glad to welcome you at Zylker Corp. To begin your journey with us, please download the attached KYC form and fill in your details. You can send us the completed form to this same email address.We cannot wait to get started! Cheers! Team Zylker",
					};

					console.log("abv thromail")
					let mailPromise = thromail(config, catalystApp);
					console.log("blw thromail")
					console.log(childData.email, "status");
					mailPromise.then((m)=>{console.log(m, "success");}).catch((e)=>{console.log(e, "errorpromise")})
				}


			  } 
			});
			setTimeout(() => {
				context.closeWithSuccess();
			}, 50000);
		
		  });
		 
		 
		 /*
		 {
			console.log("testtt");
			let dateN = getDateNow();
			dateN = dateN.substr(0, 5);
			 snapshot.forEach((childSnapshot) => {
				   const childKey = childSnapshot.key;
				   const data = childSnapshot.val();
		   if(data.date.substr(0,5) === dateN || true){
	
	
		let email = catalystApp.email();
		let config = { 
		from_email: 'guruprasath.m@zohomail.in',
		to_email: 'vtu15454@gmail.com',
		cc: 'vtu15454@gmail.com',
		bcc: 'vtu15454@gmail.com',
	 reply_to: 'guruprasath.m@zohomail.in',
		subject: 'Happy birthday!', 
		content: "Hello,We're glad to welcome you at Zylker Corp. To begin your journey with us, please download the attached KYC form and fill in your details. You can send us the completed form to this same email address.We cannot wait to get started! Cheers! Team Zylker",
		 };
		 let mailPromise = email.sendMail(config);
		 mailPromise.then((m)=>{console.log(m, "msfpromf");}).catch((e)=>{console.log(e, "errorpromise")})
	
		 console.log(JSON.stringify(mailPromise), "mailprccomise");
	}});}*/
	
	
	
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