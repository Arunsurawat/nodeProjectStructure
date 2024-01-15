const fs = require('fs');
const xml2js = require('xml2js');

const xmlFilePath = '../../uploads/xml-file.xml';
const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');

console.log({xmlData})
xml2js.parseString(xmlData, (err, result) => {
    if (err) {
        console.error('Error parsing XML:', err);
        return;
    }
    console.log({result});
    const toc = result.toc; // Adjust based on your XML structure
    console.log({toc})
    if (!toc || !toc.chapter) {
        console.error('TOC not found or has an unexpected structure.');
        return;
    }

    // Iterate through chapters in TOC
    toc.chapter.forEach((chapter, index) => {
        const chapterNumber = index + 1;
        const chapterTitle = chapter.title[0]; // Adjust based on your XML structure

        // Extract content for the current chapter
        const content = extractContentForChapter(result, chapterNumber);

        // Convert the content back to XML
        const xmlBuilder = new xml2js.Builder();
        const chapterXml = xmlBuilder.buildObject(content);

        // Write the chapter to a new file
        const chapterFileName = `chapter_${chapterNumber}_${chapterTitle}.xml`;
        fs.writeFileSync(chapterFileName, chapterXml, 'utf-8');

        console.log(`Chapter ${chapterNumber} written to ${chapterFileName}`);
    });
});

function extractContentForChapter(xmlResult, chapterNumber) {
    // Implement logic to extract content for the specified chapter
    // You might need to navigate through your XML structure to find the relevant content
    // For example: xmlResult.books.book.find(book => book.chapterNumber === chapterNumber);

    // Return the extracted content as an object
    return { chapter: xmlResult.books.book[chapterNumber - 1] };
}
