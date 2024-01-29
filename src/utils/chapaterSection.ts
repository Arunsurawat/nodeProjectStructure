export function generateChapterSection(chapterArray:any) {
    console.log(chapterArray)
	if (chapterArray.length > 0) {
		console.log("=====JSON.stringify(chapterArray)=======",JSON.stringify(chapterArray))
		return chapterArray.map((chapterObj,index) => {
			console.log("========+++++chapterObj++++++++", chapterObj)
			const containsChapterResult = hasChapter(chapterObj);
			if (chapterObj) {
				let chap=''; 
				let chapNumber ='';
				if (typeof chapterObj == 'object' && containsChapterResult){
					chap = typeof chapterObj == 'object' && chapterObj._?.trim().split(" ")[0];
					chapNumber = typeof chapterObj == 'object' && chapterObj._?.trim().split(" ")[1];
				}else{
					if (typeof chapterObj == 'string' && chapterObj.includes("CHAPTER")){
						const getChapter = chapterObj.trim().split(" ")
						if (chapterObj.length < 11){
							chap = getChapter[0];
							chapNumber = getChapter[1]
						}else {
							// Regular expression to extract "CHAPTER" and "2"
							const regex = /^([^\d]+)\s+(\d+)/;
							// Use match to find the matches
							const matches = chapterObj.match(regex);
							chap = matches && matches[1];
							chapNumber = matches && matches[2];
						}
					}
					
				}
				
				let chapHeading = '';
				let secNumber = '';
				let secName = '';
				let subSecNumber = '';
				let subSecName = '';
				let allSectionPtagData= '';

				if (chap == "CHAPTER"){
					chapHeading = chapterArray[index+1];
					const match = chapterArray[index+2].match(/(.*\D)(\d+)(.*)/);
					secNumber = match ? match[2] : "No Data";
					secName = match ? match[3]?.trim() : "No Data";
					const subSectionData = extractCodeAndTitle(chapterArray[index + 3]?.trim());
					subSecNumber = subSectionData && subSectionData.code;
					subSecName = subSectionData && subSectionData.title;
					allSectionPtagData = chapterArray[index + 3]+chapterArray[index + 4];
					
					
					return (`<section id="VAEBC2021P1_Ch01" class="chapter" epub:type="chapter">
				<header>
					<h1 class="chapter" epub:type="title">
						<span class="label" epub:type="label">CHAPTER</span>
						<span class="chapter_number" epub:type="ordinal">${chapNumber}</span>
						<br />
						<span class="chapter_title" epub:type="title"> ${chapHeading}</span>
					</h1>
				</header>
				<section id="VAEBC2021P1_Ch01_Sec101" class="level1">
					<h1 class="level1">
						<span class="label" epub:type="label">SECTION</span>
						<span class="section_number" epub:type="ordinal">${secNumber}</span>
						<br />
						<span class="level1_title" epub:type="title">${secName}</span>
					</h1>
					<section id="VAEBC2021P1_Ch01_Sec101.1" class="level2">
						<h1 class="level2">
							<span class="section_number" epub:type="ordinal">${subSecNumber}</span>
							<span class="level2_title" epub:type="title">${subSecName}.</span>
						</h1>
					</section>
				</section>
			</section>`);
				}

				
				
			}

		})
	}
    
    
    
}

function extractCodeAndTitle(text) {
	const match = text.match(/(\d+\.\d+) (\w+ title)\./);
	if (match) {
		console.log(match)
		const code = match[1];
		const title = match[2];
		return { code, title };
	} else {
		return null;
	}
}


function hasChapter(dataObject) {
	const chapterText = dataObject._ || ''; // Extract the text value from the object
	return /\bCHAPTER\b/.test(chapterText); // Check if the word "CHAPTER" is present in the text
}

function splitChapterAndNumber(inputString) {
	// Use a regular expression to match "CHAPTER" followed by a space and one or more digits
	const match = inputString.match(/\bCHAPTER (\d+)\b/);

	// Check if a match is found and return an array containing "CHAPTER" and the matched number
	return match ? ["CHAPTER", match[1]] : null;
}

