import { breakArrayIntoChapters, breakArrayIntoKeyValuePairs, cleanString, configrationCheck, configrationSetBookName, convertOperatoresToXML, originalDataObject, removeNumber, removeNumbersFromKeys, unescapeXml, unescapeXmlTOValid } from "./common";

export function generateChapterData(data: any, originalDataObject:any) {

    
    const originalObject = removeNumbersFromKeys(originalDataObject);
    
    // console.log("originalObject===",originalObject )
    // console.log("chapterArray===", chapterArray)

    
    const firstKey = Object.keys(originalObject[0])[0];
    // console.log({ firstKey });
    const bookName = configrationSetBookName(data).toUpperCase();
    const chapterArray = data.length > 0 &&  data.map((chapterData) =>{        
        if (chapterData && typeof chapterData === 'string') {
            return chapterData.replace((bookName), "");
        }
       
    });

    
    const ChaptersArray = breakArrayIntoChapters(chapterArray, firstKey)
    // console.log({ ChaptersArray });
    
    const verifiedData = [];
    ChaptersArray.length > 0 && ChaptersArray.forEach(data => {
         data.forEach((element, index) => {
            if (element) {
                const elementKey = typeof element === 'string' && element?.trim()?.split(" ")[0];
                // console.log({elementKey});
                 originalObject.forEach(toc => {
                    for (const property in toc) {

                        if (elementKey === property) {
                            // console.log("toc[property] =====>",toc[property])
                            //  console.log("---element---",element)
                            //  console.log("data[index+1] ==",data[index+1])
                            // const headingKey = typeof toc[property] ==='string' && toc[property].split(" ")[0];
                            // const headingNumber = typeof toc[property] === 'string' && toc[property].split(" ")[1];
                            // const finalHeading = `${headingKey} ${headingNumber}`;
                            // console.log("()()()(==================", toc[property])
                            
                            const title = `${element} ${data[index + 1]}`
                            const updateTitle = element.split(' ').length > 2 ? element : title;
                            const elementHeadingTitle = cleanString(updateTitle);

                            const tocHeading = toc[property];
                            const cleanedTocHeading = cleanString(tocHeading);
                            if (elementHeadingTitle === cleanedTocHeading) {
                                // console.log({ data })
                                // return data;
                                const chapterObject = breakArrayIntoKeyValuePairs(data);
                                const verifiedArrayLastIndex =verifiedData?.length > 0 && verifiedData[verifiedData.length -1] 
                                const getIndex = verifiedData.length == 0 ? -1 : verifiedArrayLastIndex.map(el => el.key).indexOf(chapterObject[0].key);
                                if (getIndex == -1){
                                    verifiedData.push(chapterObject);
                                    
                                }
                                
                            }
                            

                        }

                    }

                })
            }
        })
    });
    // console.log("======verifiedData=====> ", verifiedData)
    // return { "chapterArray": ChaptersArray, "originalObject": originalObject, "verifiedData": verifiedData };
    
    
    // const output = checkAndUpdate(originalObject, chapterArray)
    
    
    const generatedXml =  verifiedData?.length > 0 && verifiedData.map((currentChapter, index) => {
        
        // const generatedUserNotes = generateUserNotes(currentChapter);
        // const generatedPartsData = generateParts(currentChapter);
        // const generatedSections = generateSections(currentChapter);
        // const generatedSubSections = generateSubSections(currentChapter);
        // let generatedChapterXml = '';
        // let generatedSectionXml = '';
        


        const result = currentChapter.map((ChapValue) => {
            if (configrationCheck(ChapValue.key) === "CHAPTER"){
                const getXML = generateXml(ChapValue);
                if(index === 0){
                    
                    return `<section id="VAEBC2021P1_Ch01" class="chapter" epub: type = "chapter" > ${getXML} `;
                }else{
                    return `</section> <section id="VAEBC2021P1_Ch01" class="chapter" epub: type = "chapter" > ${getXML}`;
                }
            }else {
                const generatedSectionXml = generateSection(ChapValue);
                console.log({ generatedSectionXml });
                const removetheComma = Array.isArray(generatedSectionXml) ? generatedSectionXml.join() : generatedSectionXml;
                return removetheComma;
            }
        })
        return result.join('');
    })
    return generatedXml

    

}
function generateXml(ChapValue){
    // console.log('__________________________________:',ChapValue)
    const generatedChapterXml = generateChapter(ChapValue) ? generateChapter(ChapValue) : '';
    // const generatedSectionXml = generateSection(ChapValue) ? generateSection(ChapValue) : '';

    // const generatedAppendixXml = generateAppendix(ChapValue) ? generateAppendix(ChapValue) :'';
    // const removetheCommaForChap = generatedChapterXml.join() ;
    // const removetheCommaForSec = generatedSectionXml.join() ;
    if (generatedChapterXml ) {
        const generatedXml = `
                        ${generatedChapterXml}
                       
                    `
        return generatedXml;
    }
}

function generateUserNotes(currentChapter) {
    if (currentChapter?.userNote) {
        return `<p>
                    <span class="label">User note:</span>
                    <span class="formal_usage">${currentChapter.userNote}</span>
                </p>`
    } else {
        return ''
    }
}


function generateParts(currentChapter) {
    if (currentChapter?.parts?.length > 0) {
        return currentChapter.parts.map((part, index) => {
            return `<p>
                <span class="label">PART ${part.number}</span>
                <span class="formal_usage">${part.heading}</span>
            </p>`;
        })

    } else {
        return ''
    }
}

function generateChapContent(content) {
    if (content?.length > 0) {
        // console.log({ content })
        const result = content.map((data, index) => {
            if(index > 1){
                if (data !== 'false') {
                    const sanitizedItem = convertOperatoresToXML(data);
                    const generatedData = `<p>${sanitizedItem}</p>`;

                    return generatedData;
                }
            }
            
            
        });
        return result.join('');
    } 
}

function generateContent(content) {
    if (content?.length > 0) {
        // console.log({ content })
        const result = content.map((data, index) => {
          
                if (data !== 'false') {
                    const sanitizedItem = convertOperatoresToXML(data);
                    const generatedData = `<p>${sanitizedItem}</p>`;

                    return generatedData;
                }



        });
        return result.join('');
    }
}

function generateSubSections(subSections) {
    if (subSections?.length > 0) {
        return subSections.map((data, index) => {
            return `<h1 class="level2">
                        <span class="level2_title" epub:type="title">${data}.</span>
                    </h1>`;
        });
    } else {
        return ''
    }
}

function generateChapter(ChapValue:any){
    // const generatedSections = generateSection(ChapValue);

    if (configrationCheck(ChapValue.key) === "CHAPTER" || configrationCheck(ChapValue.key) === "APPENDIX" || configrationCheck(ChapValue.key) === "PART" ) {
        const chapterNumber = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(" ")[1].split("")[0]:ChapValue.key.split(" ")[1];
        const makePartNumber = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(" ")[0] +' '+ chapterNumber : ChapValue.key.split(" ")[1] 
        const chapterHeading = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(chapterNumber)[1]: ChapValue.key.split(" ")[0];
        // console.log("@@@@@@@@@@@@@@@@@");
        // console.log({ chapterNumber });
        // console.log({ chapterHeading });
        // console.log("@@@@@@@@@@@@@@@@@");
        const chapterName = ChapValue.value[0];
      
        const generatedContent = ChapValue.value.length > 1 ? generateChapContent(ChapValue.value):'';

        const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent
        if (configrationCheck(ChapValue.key) === "PART" ){
            return `<header>
                <h1 class="chapter" epub:type="title">
                <span class="chapter_number" epub:type="ordinal">${makePartNumber}</span>
                <span class="label" epub:type="label">${chapterHeading}</span>
                    <br />
                    <span class="chapter_title" epub:type="title"> ${chapterName}</span>
                </h1>
            </header>
            ${removetheComma}`
        }else {
            return `
            <header>
                <h1 class="chapter" epub:type="title">
                    <span class="label" epub:type="label">${chapterHeading}</span>
                    <span class="chapter_number" epub:type="ordinal">${makePartNumber}</span>
                    <br />
                    <span class="chapter_title" epub:type="title"> ${chapterName}</span>
                </h1>
            </header>
            ${removetheComma}
            `
        }
    }
}

// function generatePart(ChapValue: any) {
//     if (configrationCheck(ChapValue.key) === "PART") {
//         const chapterNumber = ChapValue.key.split(" ")[1].split("")[0];
//         const chapterHeading = ChapValue.key.split(chapterNumber)[1];
//         const generatedContent = generateContent(ChapValue.value);

//         const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent
//         return `
//             <header>
//                 <h1 class="chapter" epub:type="title">
//                     <span class="label" epub:type="label">${chapterHeading}</span>
//                     <span class="chapter_number" epub:type="ordinal">${chapterNumber}</span>
//                     <br />
                    
//                 </h1>
//             </header>
//             ${removetheComma}
//             `
//     }
// }

function generateSection(ChapValue:any){
    
    if (configrationCheck(ChapValue.key) === "SECTION") {
        const text = ChapValue.key.trim();
        const heading = text.split(" ")[0];
        const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
        const sectionName = text.split(sectionNumber)[1];
        
        const generatedContent = generateContent(ChapValue.value);

        const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent
        return `<section id="VAEBC2021P1_Ch01_Sec101" class="level1">
                <h1 class="level1">
                    <span class="label" epub:type="label">${heading}</span>
                    <span class="section_number" epub:type="ordinal">${sectionNumber}</span>
                    <br />
                    <span class="level1_title" epub:type="title">${sectionName}</span>
                </h1>
                ${removetheComma}
                </section>`
    }
}

// function generateAppendix(ChapValue: any) {

//     if (configrationCheck(ChapValue.key) === "APPENDIX") {
//         const text = ChapValue.key.trim();
//         const heading = text.split(" ")[0];
//         const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
//         const sectionName = text.split(sectionNumber)[1];

//         const generatedContent = generateContent(ChapValue.value);

//         const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent
//         return `
//             <section id="VAEBC2021P1_Ch01_Sec101" class="level1">
//                 <h1 class="level1">
//                     <span class="label" epub:type="label">${heading}</span>
//                     <span class="section_number" epub:type="ordinal">${sectionNumber}</span>
//                     <br />
//                     <span class="level1_title" epub:type="title">${sectionName}</span>
//                 </h1>
                
//                 ${removetheComma}
               
//             </section>`

//     }
// }

// function contentGenerator(ChapValue:any) {
//     const chaptersXml = generateChapter(ChapValue)
    
//     switch (ChapValue) {
//         case value:
            
//             break;
    
//         default:
//             break;
//     }
//     return `<section id="VAEBC2021P1_Ch01" class="chapter" epub:type="chapter">
// 				<header>
// 					<h1 class="chapter" epub:type="title">
// 						<span class="label" epub:type="label">CHAPTER</span>
// 						<span class="chapter_number" epub:type="ordinal">${currentChapter.chapter}</span>
// 						<br />
// 						<span class="chapter_title" epub:type="title"> ${currentChapter.chapterHeading}</span>
// 					</h1>
// 				</header>
//                 ${generatedUserNotes}   
//                 ${generatedPartsData}         
// 				<section id="VAEBC2021P1_Ch01_Sec101" class="level1">
// 					${generatedSections}
// 					<section id="VAEBC2021P1_Ch01_Sec101.1" class="level2">
// 					${generatedSubSections}
// 					</section>
// 				</section>
// 			</section>`;
    
// }