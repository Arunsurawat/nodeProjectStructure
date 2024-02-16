import { breakArrayIntoChapters, breakArrayIntoKeyValuePairs, configrationCheck, originalDataObject, removeNumber, removeNumbersFromKeys, unescapeXml, unescapeXmlTOValid } from "./common";

export function generateChapterData(chapterArray: any, originalDataObject:any) {

    
    const originalObject = removeNumbersFromKeys(originalDataObject);
    
    // console.log("originalObject===",originalObject )
    // console.log("chapterArray===", chapterArray)

    
    const firstKey = Object.keys(originalObject[0])[0];
    // console.log({ firstKey });
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
                            if (`${element} ${data[index + 1]}` == toc[property] || element === toc[property]) {
                                // console.log({ data })
                                // return data;
                                const chapterObject = breakArrayIntoKeyValuePairs(data)
                                verifiedData.push(chapterObject);
                                
                            }

                        }

                    }

                })
            }
        })
    });
    // console.log("======verifiedData=====> ", verifiedData)
    // return verifiedData;
    
    
    // const output = checkAndUpdate(originalObject, chapterArray)
    
    
    const generatedXml =  verifiedData?.length > 0 && verifiedData.map((currentChapter, index) => {
        
        // const generatedUserNotes = generateUserNotes(currentChapter);
        // const generatedPartsData = generateParts(currentChapter);
        // const generatedSections = generateSections(currentChapter);
        // const generatedSubSections = generateSubSections(currentChapter);
        // let generatedChapterXml = '';
        // let generatedSectionXml = '';
        

        const result = currentChapter.map((ChapValue,index) => {
            const getXML = generateXml(ChapValue);
            return getXML;
        })
        return result.join('');
    })
    return generatedXml

    

}
function generateXml(ChapValue){
    // console.log('__________________________________:',ChapValue)
    const generatedChapterXml = generateChapter(ChapValue) ? generateChapter(ChapValue) : '';
    const generatedSectionXml = generateSection(ChapValue) ? generateSection(ChapValue) : '';

    // const generatedAppendixXml = generateAppendix(ChapValue) ? generateAppendix(ChapValue) :'';
    // const removetheCommaForChap = generatedChapterXml.join() ;
    // const removetheCommaForSec = generatedSectionXml.join() ;
    if (generatedChapterXml || generatedSectionXml) {
        const generatedXml = `<section id="VAEBC2021P1_Ch01" class="chapter" epub:type="chapter">
                        ${generatedChapterXml}
                        ${generatedSectionXml}
                    </section>`
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

function generateContent(content) {
    if (content?.length > 0) {
        // console.log({ content })
        const result = content.map((data, index) => {
            if (data !== 'false') {
                const sanitizedItem = unescapeXmlTOValid(data);
                const generatedData = `<section id="VAEBC2021P1_Ch01_Sec101.1" class="level2">
                                    <p>${sanitizedItem}</p>
                                    </section>`;
                
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
    if (configrationCheck(ChapValue.key) === "CHAPTER" || configrationCheck(ChapValue.key) === "APPENDIX" || configrationCheck(ChapValue.key) === "PART" ) {
        const chapterNumber = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(" ")[1].split("")[0]:ChapValue.key.split(" ")[1];
        const makePartNumber = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(" ")[0] +' '+ chapterNumber : ChapValue.key.split(" ")[1] 
        const chapterHeading = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(chapterNumber)[1]: ChapValue.key.split(" ")[0];
        // console.log("@@@@@@@@@@@@@@@@@");
        // console.log({ chapterNumber });
        // console.log({ chapterHeading });
        // console.log("@@@@@@@@@@@@@@@@@");

        
        const generatedContent = generateContent(ChapValue.value);

        const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent
        if (configrationCheck(ChapValue.key) === "PART" ){
            return `<header>
                <h1 class="chapter" epub:type="title">
                <span class="chapter_number" epub:type="ordinal">${makePartNumber}</span>
                <span class="label" epub:type="label">${chapterHeading}</span>
                    <br />
                    
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
        return `
            <section id="VAEBC2021P1_Ch01_Sec101" class="level1">
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