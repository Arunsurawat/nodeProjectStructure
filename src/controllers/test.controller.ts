// const fs = require('fs');
// const xml2js = require('xml2js');

// const xmlFilePath = '../../uploads/2021VirginiaExistingupdated.xml';

// const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');

// console.log({xmlData});



// xml2js.parseString(xmlData, { preserveChildrenOrder: true },(err, result) => {
//     if (err) {
//         console.error('Error parsing XML:', err);
//         return;
//     }

//     console.log("JSON.stringify(result)=======>", result);
//     const paragraphs = result.document.page[0].metadata;

//     // const Part = result['TaggedPDF-doc'].TOC;
//     // const bookmarkTree = result['TaggedPDF-doc']['bookmark-tree'][0].bookmark;


//     console.log({ paragraphs });
//     // console.log("PART ====",JSON.stringify(Part));
//     // console.log(" JSON.parse(===>",JSON.stringify(bookmarkTree));


//     if (!paragraphs) {
//         console.error('No paragraphs found in the XML.');
//         return;
//     }

//     let currentChapter = null;
//     let currentContent = [];

//     paragraphs.forEach((paragraph) => {
//         const text = paragraph._ || '';

//         // Check if it's a chapter heading
//         const chapterMatch = text.match(/CHAPTER (\d+)/);
//         if (chapterMatch) {
//             // Save the previous chapter's content if available
//             if (currentChapter !== null && currentContent.length > 0) {
//                 writeChapterToFile(currentChapter, currentContent);
//                 currentContent = [];
//             }

//             // Start a new chapter
//             currentChapter = {
//                 number: parseInt(chapterMatch[1]),
//                 title: text.replace(chapterMatch[0], '').trim(),
//             };
//         } else {
//             // Add content to the current chapter
//             currentContent.push(text);
//         }
//     });

//     // Write the last chapter to a file
//     if (currentChapter !== null && currentContent.length > 0) {
//         writeChapterToFile(currentChapter, currentContent);
//     }
// });

// function writeChapterToFile(chapter, content) {
//     // Convert the content back to XML
//     const xmlBuilder = new xml2js.Builder();
//     const chapterXml = xmlBuilder.buildObject({
//         chapter: {
//             number: chapter.number,
//             title: chapter.title,
//             content: content,
//         },
//     });

//     // Write the chapter to a new file
//     const chapterFileName = `chapter_${chapter.number}_${chapter.title}.xml`;
//     fs.writeFileSync(chapterFileName, chapterXml, 'utf-8');

//     console.log(`Chapter ${chapter.number} written to ${chapterFileName}`);
// }




// const inputString = "CHAPTER 1 ADMINISTRATION . . . . . . . . . . . . . . 1-1,Section,101 General. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1-1 102 Purpose and Scope. . . . . . . . . . . . . . . . . . . . . . . . 1-2 103 Application of Code. . . . . . . . . . . . . . . . . . . . . . . . 1-3";
const inputString = `CHAPTER 6 ALTERATIONS . . . . . . . . . . . . . . . . . 6-1 ","Section 601 General . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6-1 602 Alteration—Level1 . . . . . . . . . . . . . . . . . . . . . . . 6-2 603 Alteration—Level2. . . . . . . . . . . . . . . . . . . . . . . . 6-4 ",
"CHAPTER 7 CHANGE OF OCCUPANCY. . . . . . . 7-1 ",
"Section 701 General . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7-1 702 Special Use and Occupancy . . . . . . . . . . . . . . . . . 7-1 703 Building Elements and Materials . . . . . . . . . . . . . 7-1 704 Fire Protection. . . . . . . . . . . . . . . . . . . . . . . . . . . . 7-1 705 Means of Egress . . . . . . . . . . . . . . . . . . . . . . . . . . 7-2 706 Heights and Areas . . . . . . . . . . . . . . . . . . . . . . . . . 7-4 707 Exterior Wall Fire-Resistance Ratings . . . . . . . . . 7-4 708 Electrical and Lighting . . . . . . . . . . . . . . . . . . . . . 7-5 709 Mechanical and Ventilation. . . . . . . . . . . . . . . . . . 7-5 710 Plumbing . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7-5 711 Structural . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7-5 712 Accessibility . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7-6 ",
"CHAPTER 8 ADDITIONS. . . . . . . . . . . . . . . . . . . . . 8-1 ",
"Section 801 General . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8-1 802 Heights and Areas . . . . . . . . . . . . . . . . . . . . . . . . . 8-1 803 Structural . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8-1 804 Flood Hazard Areas. . . . . . . . . . . . . . . . . . . . . . . . 8-2 805 Energy Conservation. . . . . . . . . . . . . . . . . . . . . . . 8-2 ",
"CHAPTER 9 HISTORIC BUILDINGS . . . . . . . . . . 9-1 ",
"Section 901 General . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9-1 902 Flood Hazard Areas. . . . . . . . . . . . . . . . . . . . . . . . 9-1 903 Repairs. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9-1 904 (Reserved) .. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9-1 905 Alterations . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9-1 906 Change of Occupancy . . . . . . . . . . . . . . . . . . . . . . 9-2 907 Structural . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9-2,`
// Splitting the string by ","
const splitByComma = inputString.split(',');

// Merging content that ends with ",", "..", and then a number
let mergedArray = [];
let currentMerge = '';
console.log({splitByComma});

for (let i = 0; i < splitByComma.length; i++) {
    const currentItem = splitByComma[i].trim();

    if ( /\d+$/.test(currentItem)) {
        console.log("inside if");
        currentMerge += currentItem;
        console.log({currentItem});
        
        // const secondLine = currentItem.match('...')&&currentItem.split('-')
        // console.log({secondLine});
        const splitByDigitDigitSpace = currentItem.match('.....') && inputString.split(/\d-\d\s/);
        console.log({splitByDigitDigitSpace})
    } else {
        if (currentMerge !== '') {
            mergedArray.push(currentMerge.trim());
            currentMerge = '';
        }
        mergedArray.push(currentItem);
    }
}

// Adding the last merged item if any
if (currentMerge !== '') {
    mergedArray.push(currentMerge.trim());
}

// Joining the merged array back into a string
const resultString = mergedArray.join(',');

console.log(resultString);












