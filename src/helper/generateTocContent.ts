import { configrationCheck, removeNumbersFromKeys } from "./common";

export function generateTocContent(data:any) {
    const newArray = removeNumbersFromKeys(data);
    // return newArray
    const result = newArray.length > 0 && newArray.map((chapter, index) => {
        
        
        
        
        let chapterNumber = '';
        let chapterName = '';
        // let sectionView = "";
        let partView = "";
        let appendixView = "";
        // if (chapter["CHAPTER"]) {
        //     const text = chapter.CHAPTER?.trim();
        //     const heading = text.split(" ")[0];
        //     chapterNumber = text.split(" ")[1];
        //     chapterName = text.substring(heading.length + 1 + chapterNumber.length + 1);
        // }
        // if (chapter["SECTION"]) {
        //     const text = chapter.SECTION?.trim();
        //     const heading = text.includes("Section")&& text.split(" ")[0];
        //     const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
        //     const sectionName = text.split(sectionNumber)[1];
        
        //     sectionView = `<div class="toc_level_2"><p><span class="ordinal">${sectionNumber} </span><span class="text"> ${sectionName} </span><span class="locator"> <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a></span></p></div>`
        // }

        // if (chapter["PART"]) {
        //     const text = chapter.PART?.trim();
        //     const heading = text.includes("PART") && text.split(" ")[0];
        //     const partNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
        //     const partName = text.split(partNumber)[1];;

        //     partView = `<div class="toc_level_2"><p>${heading}<span class="ordinal">${partName} </span><span class="text"> ${partNumber} </span><span class="locator"> <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a></span></p></div>`
        // }

        // if (chapter["APPENDIX"]) {
        //     const text = chapter.APPENDIX?.trim();
        //     const heading = text.includes("PART") && text.split(" ")[0];
        //     const chapterHeading = heading ? text.split(" ")[1] : text.split(" ")[0];
        //     const chapterNumber = text.split(heading)[1].split(chapterHeading)[1].split(" ")[1];
        //     const chapterName = text.split(chapterNumber)[1];

        //     appendixView = `<div class="toc nomark"><div class="toc_level_1"><p><span class="label">${heading} </span><span class="ordinal">${chapterHeading} ${chapterNumber} </span><span class="text"> ${chapterName}</span></p></div></div>`
        // }
        const generatedCHapterXml = generateChapter(chapter);
        const sectionView = generateSection(chapter);
        
        
        
        return `<div class="toc nomark">
            <div class="toc_level_1">
                ${generatedCHapterXml}
                <p>
                    <span class="content_left">Section</span>
                </p>
                <div class="toc nomark">
                    <div class="toc_level_2">
                       ${sectionView} 
                    </div>
                </div>
            </div>
        </div>`
        
        
        
        
        
        // return `<div class="toc nomark"><div class="toc_level_1">${generatedCHapterXml}${sectionView}${partView}${appendixView}</div></div></div>`

    })
    return result;
    
}

function generateChapter(chapter: any) {
    let result = '';
    for (const ChapValue in chapter) {
        // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", chapter)
        // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", ChapValue)

        if (configrationCheck(ChapValue) === "CHAPTER") {
            const text = chapter[ChapValue]?.trim();
            const heading = text.split(" ")[0];
            const chapterNumber = text.split(" ")[1];
            const chapterName = text.substring(heading.length + 1 + chapterNumber?.length + 1);
            result = `<p>
                                <span class="label">${heading} </span>
                                <span class="ordinal">${chapterNumber}</span>
                                <span class="text"> ${chapterName} </span>
                                <span class="locator">
                                    <a class="toc_pages" href="#VAEBC2021P1_Ch01">1-1</a>
                                </span>
                            </p>`
        }
        return result;
    }
    
}

function generateSection(data: any) {
    let result = ''; // Initialize an empty string to accumulate the generated HTML

    for (const chapter in data) {
        // console.log("#####################################chapter in data######", chapter, data);

        if (configrationCheck(chapter) === "SECTION") {
            const sectionArray = data[chapter];
            // console.log({ sectionArray })

            if (Array.isArray(sectionArray)) {
                for (const ChapValue of sectionArray) {
                    // console.log("_____________________", ChapValue);
                    const data = typeof ChapValue === 'string' && ChapValue?.trim();
                    const text = data.includes('Section') ? data : `Section ${data}`
                    const heading = text.split(" ")[0];
                    const sectionNumber = text.split(" ")[1];
                    const sectionName = text.substring(heading.length + 1 + sectionNumber?.length + 1);

                    // Accumulate the generated HTML for each section
                    
                    result +=`<p>
                                    <span class="ordinal">${sectionNumber}</span>
                                    <span class="text">${sectionName} </span>
                                    <span class="locator">
                                        <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a>
                                    </span>
                                </p>`
                }
            } else {
                const sectionHeading = data[chapter];
                // console.log("_____________________", sectionHeading);

                const text = typeof sectionHeading === 'string' && sectionHeading?.trim();
                const heading = text.split(" ")[0].includes('Section') ? text.split(" ")[0] : 'Section';
                const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
                const sectionName = text.substring(heading.length + 1 + sectionNumber?.length + 1);

                // Accumulate the generated HTML for each section
                result += `<p>
                            <span class="ordinal">${sectionNumber}</span>
                            <span class="text">${sectionName} </span>
                            <span class="locator">
                                <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a>
                            </span>
                        </p>`
                
            }
        }
    }

    return result; // Return the accumulated HTML after the loop has finished processing
}

// function generateSection(data: any) {
   
//     for (const chapter in data) {
//         console.log("#####################################chapter in data######", chapter, data);

//         if (configrationCheck(chapter) === "SECTION") {
            
//             const sectionArray = data[chapter];
//             console.log({ sectionArray })
//             if (Array.isArray(sectionArray)){
//                 for (const ChapValue of sectionArray) {

//                     console.log("_____________________", ChapValue);
//                     const text = typeof ChapValue === 'string' && ChapValue?.trim();

//                     const heading = text.split(" ")[0];
//                     const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
//                     const sectionName = text.substring(heading.length + 1 + sectionNumber?.length + 1);


//                     return `<p><span class="content_left">${heading}</span></p><div class="toc nomark"><div class="toc_level_2"><p><span class="ordinal">${sectionNumber} </span><span class="text"> ${sectionName} </span><span class="locator"> <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a></span></p></div></div>`

//                 }
//             }else {
//                 const sectionHeading = data[chapter];
//                 console.log("_____________________", sectionHeading);

//                 const text = typeof sectionHeading === 'string' && sectionHeading?.trim();
//                 const heading = text.split(" ")[0];
//                 const sectionNumber = heading ? text.split(" ")[1] : text.split(" ")[0];
//                 const sectionName = text.substring(heading.length + 1 + sectionNumber?.length + 1);
//                 return `<p><span class="content_left">${heading}</span></p><div class="toc nomark"><div class="toc_level_2"><p><span class="ordinal">${sectionNumber} </span><span class="text"> ${sectionName} </span><span class="locator"> <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a></span></p></div></div>`
                
                
//             }
            

//         }
//     }
    
// }




// const newArray: any = [
//     {
//         CHAPTER: "CHAPTER 1 ADMINISTRATION",
//         SECTION: "Section 1401 General",
//         PART: "PART I PARTAdmin",
//         APPENDIX: "APPENDIX CHAPTER 1",
//     },
//     {
//         CHAPTER: "CHAPTER 2 ADMINISTRATION",
//         SECTION: "Section 1401 General",
//         PART: "PART I PARTAdmin",
//         APPENDIX: "APPENDIX CHAPTER 1 appendixHeading",
//     }]
