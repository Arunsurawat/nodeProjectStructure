import { breakArrayIntoChapters, breakArrayIntoKeyValuePairs, cleanString, configrationCheck, configrationSetBookName, convertOperatoresToXML, originalDataObject, removeNumber, removeNumbersFromKeys, unescapeXml, unescapeXmlTOValid ,bookShortCode, areSimilar, convertSubSectionXML, bookTitle} from "./common";

export function generateChapterData(data: any, originalDataObject:any) {

    
    const originalObject = removeNumbersFromKeys(originalDataObject);
    
    // console.log("originalObject===",originalObject )
    // console.log("chapterArray===", chapterArray)

    
    // const firstKey = Object.keys(originalObject[0])[0];
    // console.log({ firstKey });
    const bookName = bookTitle;
    // const bookName = configrationSetBookName(data).toUpperCase();
    const chapterArray = data.length > 0 &&  data.map((chapterData) =>{        
        if (chapterData && typeof chapterData === 'string') {
            if(bookName){
                chapterData.replace((bookName), "");
            }
            return chapterData
        }
       
    });

    
    const ChaptersArray = breakArrayIntoChapters(chapterArray);
    // return { chapterArray, firstKey };
    // console.log({ ChaptersArray });
    // return ChaptersArray
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
                            const updateTitle = element.length > 12 ? element : title;
                            const elementHeadingTitle = cleanString(updateTitle);

                            const tocHeading = toc[property];
                            const cleanedTocHeading = cleanString(tocHeading);
                            if (areSimilar(elementHeadingTitle, cleanedTocHeading, 12)) {
                                // console.log({ data })
                                // return data;
                                const chapterObject = breakArrayIntoKeyValuePairs(data);
                                const verifiedArrayLastIndex =verifiedData?.length > 0 && verifiedData[verifiedData.length -1] 
                                const getIndex = verifiedData.length == 0 ? -1 : verifiedArrayLastIndex.map(el => el.key)?.indexOf(chapterObject[0]?.key);
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
        

        let currentChapterNumber = ''
        const result = currentChapter.map((ChapValue) => {
            if (configrationCheck(ChapValue.key) === "CHAPTER"){
                let getXMLData = generateXml(ChapValue);
                currentChapterNumber = getXMLData.number
                if(index === 0){
                    return `<section id="${bookShortCode}_Ch${currentChapterNumber}" class="chapter" epub:type = "chapter" > ${getXMLData.xml} `;
                }else{
                    return `</section> <section id="${bookShortCode}_Ch${currentChapterNumber}" class="chapter" epub:type = "chapter" > ${getXMLData.xml}`;
                }
            }else if (configrationCheck(ChapValue.key) === "APPENDIX") {
                const generatedAppendixXml: any = generateAppendix(ChapValue);

                const validAppendixXml = (generatedAppendixXml !== undefined) ? generatedAppendixXml : '';


                const removetheCommaFromAppendixXml = Array.isArray(validAppendixXml) ? validAppendixXml.join() : validAppendixXml;
                const finalAppendix = removetheCommaFromAppendixXml ? removetheCommaFromAppendixXml : "";
                // return `</section>${finalAppendix}`;       
                if (index === 0) {
                    return `</section>  <section id="${bookShortCode}_Appx" class="appendix" epub:type="appendix"> ${finalAppendix} </section>`;
                } else {
                    return `</section>  <section id="${bookShortCode}_AppxA" class="appendix" epub:type="appendix"> ${finalAppendix}`;
                }
               

            } else {
                const generatedSectionXml = generateSection(ChapValue, currentChapterNumber);
                const removetheComma = Array.isArray(generatedSectionXml) ? generatedSectionXml.join() : generatedSectionXml;
                
                const validRemovetheComma = removetheComma ? removetheComma : '';
                return validRemovetheComma;
            }
            
        })
        return result.join('');
    })
    return generatedXml

    

}
function generateXml(ChapValue){
    // console.log('__________________________________:',ChapValue)
    const generatedChapterData = generateChapter(ChapValue) ? generateChapter(ChapValue) : {number : '', type : '', xml:''};
    return generatedChapterData
    // const generatedSectionXml = generateSection(ChapValue) ? generateSection(ChapValue) : '';

    // const generatedAppendixXml = generateAppendix(ChapValue) ? generateAppendix(ChapValue) :'';
    // const removetheCommaForChap = generatedChapterXml.join() ;
    // const removetheCommaForSec = generatedSectionXml.join() ;
    // if (generatedChapterData?.xml ) {
    //     const generatedXml = `${generatedChapterData.xml}`
    //     return {generatedXml};
    // }
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
                    const generatedData = (sanitizedItem !== "undefined") ?`<p>${sanitizedItem}</p>`:'';

                    return generatedData;
                }
            }
            
            
        });
        return result.join('');
    } 
}

function generateContent(ChapterData,ChapterNumber) {
    // if (content?.length > 0) {
    //     const result = content.map((data, index) => {
    //         if (data !== 'false') {
    //             const sanitizedItem = convertOperatoresToXML(data);
    //             const generatedData = (sanitizedItem !== "undefined") ?`<p>${sanitizedItem}</p>`: '';
    //             return generatedData;
    //         }
    //     })
        
    //     return result.join('');
    // }

    // let xmlOutput ='';
    
    // ChapterData.forEach((data) => {
    //     if (data.startsWith("__PLACEHOLDER_LIST_CONTENT__")) {
    //         xmlOutput += createList(ChapterData);
    //     } else {
    //         xmlOutput += convertSubSectionXML(ChapterData);
    //     }
    // });
    // return xmlOutput;
    
    
    
    // const generateSubSection = convertSubSectionXML(ChapterData);
    // return generateSubSection;
    let generatedData = createList(ChapterData,ChapterNumber)
    generatedData = generatedData.replace(/__PLACEHOLDER_LIST_CONTENT__|__PLACEHOLDER_SUB_LIST_CONTENT__/g, '');
    return generatedData

}

// function generateContent(content) {
//     if (content?.length > 0) {
//         const getContentData = createList(content)
//         // console.log({ content })
//         // const result = content.map((data, index) => {
          
//         //         if (data !== 'false') {
//         //             const sanitizedItem = convertOperatoresToXML(data);
//         //             const generatedData = `<p>${sanitizedItem}</p>`;

//         //             return generatedData;
//         //         }



//         // });
//         // return getContentData.join('');
//     }
// }
function createList(list, ChapterNumber) {
    if(list){
        list = list.filter(item =>  item != '' );
        let inList = false; // Flag to track whether we're currently inside a list
        let listHTML = ''; // Variable to store the generated list HTML

        let patternMatchSublist = /^(\b(?![0-9]{3}\.)\d{0,2}(\.\d+|\.\d+\.[a-zA-Z]|\.[a-zA-Z])\b)/g;
        let currentSubList = ''
        const regex  =/^(\d+(\.\d+)?\.)/;

         list =  list.flatMap(item => {
             // Use regex to find matches in the item
             const match =  item.replace('__PLACEHOLDER_LIST_CONTENT__ ', '').trim().match(regex);
             const patternMatch = item.replace('__PLACEHOLDER_LIST_CONTENT__ ', '').trim().match(patternMatchSublist)
             if (match && patternMatch?.length>0 && !item.includes('__PLACEHOLDER_LIST_CONTENT__')) {
                 // If a match is found, return an array with the full number and the rest of the string
                 return [match[0], item.substring(match[0].length)];
             } else {
                 // If no match is found, return the original item
                 return item;
             }
         });
        list = list.map((item, index,array) =>  {

            let matches = item.replace(/LACEHOLDER_LIST_CONTENT__|__PLACEHOLDER_LIST_CONTENT__/g, '').trim().match(patternMatchSublist);
            if(matches && matches.length>0 ){
                return item =  '__PLACEHOLDER_SUB_LIST_CONTENT__ __PLACEHOLDER_LIST_CONTENT__' + ' ' + item 
            }else{
                return item
            }
        } );


        list.forEach((item, index,array) => {
            if (item && item !== 'false' && item != undefined) {
                
                let sanitizedItem = convertOperatoresToXML(item); // You may need to define this function
      
                if (  sanitizedItem.includes("__PLACEHOLDER_LIST_CONTENT__") ) {
                    if(!array[index-2]?.includes("__PLACEHOLDER_LIST_CONTENT__") ){
                        listHTML +=  `<div class="list"><ol class="no_mark"><li><p><span class="label">${sanitizedItem}</span>`
                    }else{
                        if(sanitizedItem.startsWith('__PLACEHOLDER_SUB_LIST_CONTENT__')){
                                currentSubList += currentSubList ?  `<li><p><span class="label subList"> ${sanitizedItem}</span>` : 
                                `
                                  <ol class="no_mark subList"><li><p><span class="label subList">${sanitizedItem}</span>
                                `
                        }else{
                            if(currentSubList){
                                listHTML += currentSubList + '</ol></li>'
                                currentSubList = ''
                            }
                            listHTML +=  `<li><p><span class="label"> ${sanitizedItem}</span>`
                        }
                    }


                    // if(array[index+2]){
                    //     inList = true;
                    // }else{
                    //     listHTML += '</p></li></ol></div>'
                    // }
                    if((array.length-1) == index){
                        listHTML += '</p></li></ol></div>'
                    }else{
                        inList = true;
                    }
                    
                } else if (inList) {
                    // If inside a list, add list item
                    if(!array[index]?.includes("__PLACEHOLDER_LIST_CONTENT__") && array[index+1] && !array[index+1].includes("__PLACEHOLDER_LIST_CONTENT__") ){
                        if(currentSubList){
                            currentSubList +=  sanitizedItem + '</p></li></ol>'
                        }else{
                            listHTML +=  sanitizedItem + '</p></li></ol></div>'
                        }
                        inList = false;
                    }else{
                            if(currentSubList){
                                currentSubList += sanitizedItem + '</p></li>'
                            }else if(index == array.length-1 ){
                                listHTML +=  sanitizedItem + '</p></li> </ol></div>' 
                            }else if(array[index+1]?.includes("__PLACEHOLDER_SUB_LIST_CONTENT__")){
                                listHTML +=  sanitizedItem + '</p>' 
                            }else if(array[index+1]?.includes("__PLACEHOLDER_LIST_CONTENT__")){
                                listHTML +=  sanitizedItem + '</p></li>' 
                            }else{
                                listHTML +=  sanitizedItem + '</p>' 
                            }
                    }
                } else {
                    if(currentSubList){
                        listHTML += currentSubList + '</li></ol></div>'
                        currentSubList = ''
                    }
                    listHTML += convertSubSectionXML(sanitizedItem, ChapterNumber);
                }
            }
        });
        inList = false;
        
        return listHTML;
    }
}
function generateSubList(list){
        // console.log(list)
    // list.forEach((item, index,array) => {
    // })

}

function removePlaceHolder(str){
    return str.replace(/__PLACEHOLDER_LIST_CONTENT__|__PLACEHOLDER_SUB_LIST_CONTENT__/g, '');

}



// function createList(list){
//     let inListNextContent:any = ''
//     let  currentListHTML = '<div class="list"><ol class="no_mark">';

//      const result = list.map((item, index) => {
//          if (item !== 'false') {
//              const sanitizedItem = convertOperatoresToXML(item);
//              if (item.includes("__PLACEHOLDER_LIST_CONTENT__")) {
//                      // let removeFlagContent = item.replace("__PLACEHOLDER_LIST_CONTENT__", "");
//                      inListNextContent = false
//                      return '<div class="list"><ol class="no_mark"><li><p> <span class="label">' + item + '</span>'  + list[index + 1] + '</p></li>'
//              }else if(inListNextContent){
//                  if(inListNextContent == false && inListNextContent != ''){
//                      return `</ol></div><p>${sanitizedItem}</p>`
//                  }else{
//                      return `<p>${sanitizedItem}</p>`
//                  }
//              }else{
//                 inListNextContent = true
//              }
//          }
//      });
//   return result.join('');
 
//  }

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

    if (configrationCheck(ChapValue.key) === "CHAPTER" || configrationCheck(ChapValue.key) === "PART" ) {
        const chapterNumber = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(" ")[1].split("")[0]:ChapValue.key.split(" ")[1];
        const makePartNumber = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(" ")[0] +' '+ chapterNumber : ChapValue.key.split(" ")[1] 
        const chapterHeading = configrationCheck(ChapValue.key) === "PART" ? ChapValue.key.split(chapterNumber)[1]: ChapValue.key.split(" ")[0];
        // console.log("@@@@@@@@@@@@@@@@@");
        // console.log({ chapterNumber });
        // console.log({ chapterHeading });
        // console.log("@@@@@@@@@@@@@@@@@");
        const chapterName = ChapValue.value[0];
      
        const generatedContent = ChapValue.value.length > 1 ? generateChapContent(ChapValue.value):'';

        const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent;
        const finalContent = removetheComma !== undefined ? removetheComma : '';
    
        if (configrationCheck(ChapValue.key) === "PART" ){
            return {
                number : makePartNumber,
                type : configrationCheck(ChapValue.key),
                xml : `<header>
            <h1 class="chapter" epub:type="title">
            <span class="chapter_number" epub:type="ordinal">${makePartNumber}</span>
            <span class="label" epub:type="label">${chapterHeading}</span>
                <br />
                <span class="chapter_title" epub:type="title"> ${chapterName}</span>
            </h1>
        </header>
        ${finalContent}`
    }
        }else {
            return{
                number : makePartNumber,
                type : configrationCheck(ChapValue.key),
                xml :  `
                <header>
                    <h1 class="chapter" epub:type="title">
                        <span class="label" epub:type="label">${chapterHeading}</span>
                        <span class="chapter_number" epub:type="ordinal">${makePartNumber}</span>
                        <br />
                        <span class="chapter_title" epub:type="title"> ${chapterName}</span>
                    </h1>
                </header>
                ${finalContent}
                `
    }
            
           
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

function generateSection(ChapValue:any, chapterNumber:any){
    
    if (configrationCheck(ChapValue.key) === "SECTION") {
        const text = ChapValue.key.trim();
        const heading = text.split(" ")[0];
        const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
        const sectionName = text.split(sectionNumber)[1];
        const generateBookShortCode = `${bookShortCode}_Ch${chapterNumber}_Sec`;
        const generatedContent = generateContent(ChapValue.value, generateBookShortCode);
    
        // const generatedSubList = generateSubList(generatedListContent)


        const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent;
        const finalContent = removetheComma !== undefined ? removetheComma: '';
        return `<section id="${bookShortCode}_Ch${chapterNumber}_Sec${sectionNumber}" class="level1">
                <h1 class="level1">
                    <span class="label" epub:type="label">${heading}</span>
                    <span class="section_number" epub:type="ordinal">${sectionNumber}</span>
                    <br />
                    <span class="level1_title" epub:type="title">${sectionName}</span>
                </h1>
                ${finalContent}
                </section>`
    }
}

function generateAppendix(ChapValue: any) {
    if (configrationCheck(ChapValue.key) === "APPENDIX") {
        const text = ChapValue.key.trim();
        const heading = text.split(" ")[0];
        const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
        const appendixName = ChapValue?.value[0];
        const generateBookShortCode = `${bookShortCode}_AppxE_SecE`;
        const generatedContent = generateContent(ChapValue.value, generateBookShortCode);

        const removetheComma = Array.isArray(generatedContent) ? generatedContent.join() : generatedContent;
        const finalContent = removetheComma !== undefined ? removetheComma : '';          
        return `
                <header>
                <h1 class="appendix" epub:type="title"><span class="label" epub:type="label">APPENDIX</span><span class="appendix_number" epub:type="ordinal">${sectionNumber}</span><br/><span class="appendix_title" epub:type="title">${appendixName}</span></h1>
                <div class="help">
                <span class="bold">The provisions contained in this appendix are not mandatory unless specifically referenced in the adopting ordinance.</span>
                </div>
                </header>
               ${finalContent}
            `

    }
}

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