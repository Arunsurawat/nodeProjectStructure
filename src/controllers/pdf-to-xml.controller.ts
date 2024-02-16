import { NextFunction, Request, Response } from "express";
import { UploadedFile } from 'express-fileupload';
import Pdf2Json from 'pdf2json';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import xmlbuilder from 'xmlbuilder';
import { parseString, Builder } from 'xml2js';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as util from 'util';
import { findTOC, removeTOC } from '@utils/findTableOfContent'
import { generateChapterSection } from "@/utils/chapaterSection";
import { generateAllDataArray } from "@/utils/generateAllDataArray";
import { generateTocContent } from "@/helper/generateTocContent";
import { configrationCheck, getAllPTagData } from "@/helper/common";
import { generateChapterData } from "@/helper/generateChapterData";
declare module 'express' {
    interface Request {
        file: { [key: string]: UploadedFile[] };
    }
}

interface TOCObject {
    [key: string]: any;
}
class PdfToXmlController {
    public convertXml = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // res.status(200).send("<h1>PDF TO XML</h1>")
            // console.log("REQ FILE 1 ========", req);
            console.log("REQ FILE 2 ========", req.file);
            const uploadedFile = req.file as UploadedFile;
            console.log({ uploadedFile })
            if (!uploadedFile) {
                return res.status(400).json({ error: 'No file uploaded.' });
            }

            fs.access(uploadedFile.path, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error('The file does not exist.');
                    return;
                }

                // Convert the PDF to text
                fs.readFile(uploadedFile.path, (err, buffer) => {
                    if (err) {
                        console.error('Error during conversion:', err);
                        return;
                    }
                    console.log({ buffer })
                    pdfParse(buffer).then((data) => {

                        res.status(200).send(data)
                    });
                });
            });

        } catch (error) {
            next(error);
        }
    };

    public createXml = (req: Request, res: Response, next: NextFunction) => {
        try {
            // res.status(200).send("<h1>PDF TO XML</h1>")
            // console.log("REQ FILE 1 ========", req);
            // console.log("REQ FILE 2 ========", req.file);
            const uploadedFile = req.file as UploadedFile;
            if (!uploadedFile) {
                return res.status(400).json({ error: 'No  file uploaded.' });
            }
            console.log({ uploadedFile })

            // Read XML file content
            // const xmlData: string = fs.readFileSync(uploadedFile.path, 'utf-8');

            fs.readFile(uploadedFile.path, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }
                // Replace <H1>, <H2>, <H3>, <H4>, <H5>, and <H6> tags with <P> tags
                let modifiedData = data.replace(/<\s*(\/)?\s*(H[1-6])(\s+[^>]*)?>/g, (match, p1, p2) => {
                    if (p1 === '/') {
                        return '</P>'; // Closing tag
                    } else {
                        return '<P>'; // Opening tag
                    }
                });
                // Remove the <Part> and </Part> tags 
                modifiedData = modifiedData.replace(/<Part>(.*?)<\/Part>/gs, '$1');


                // Remove the <Sect> and </Sect> tags and <Sect />
                const pattern = /<Sect\s*\/?>|<\/Sect>/g;
                modifiedData = modifiedData.replace(pattern, '');

           
            
            
            // Parse XML to JavaScript object
                xml2js.parseString(modifiedData, { explicitArray: false, preserveChildrenOrder: true, mergeAttrs: false }, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                    return;
                }
                // console.log("Ressult ===============> ", JSON.stringify(result));

                const paragraphs = result['TaggedPDF-doc'];
                // console.log("JSON.stringify(paragraphs)=============", JSON.stringify(paragraphs));
                const bookAllData = result['TaggedPDF-doc'];
                // const bookTitle = result['TaggedPDF-doc']["P"] ? result['TaggedPDF-doc']["P"][0]["_"] : "NO DATA";

                const tocData: TOCObject | null = findTOC(result['TaggedPDF-doc']);
                const withoutTOC: TOCObject | null = removeTOC(result['TaggedPDF-doc']);
            
                // New Approach start
                
                const withoutTOCAllPTagData = getAllPTagData(withoutTOC);
                
                
                
                
                
                // =================================================================================
                    

                    function generateObject(key, value, index) {
                        const bookObj = {
                            [key + index]: value
                        };

                        // Push the value into the array under the given key
                        // bookObj[key+index] = value;
                        return bookObj; // Return the updated bookObj
                    }
                
                    const newData = tocData?.TOC?.P.join()
                    const regexPattern = /\s*\.\s*\.\s*(?=[a-zA-Z\d]+)/g;
                    let outputArray = newData && newData.split(regexPattern).map((segment, index) => {
                        if (index == 0)
                            return segment
                        // Remove content until the first space
                        if (segment.startsWith('APPENDIX')) {
                            return segment.split(' ').slice(2).join(' ');
                        } else {
                            return segment.split(' ').slice(1).join(' ');
                        }
                    });

                    outputArray = outputArray.length > 0 && outputArray.map(function (element) {
                        // Remove periods and commas from the result
                        element = element.replace("TABLE OF CONTENTS ", "").trim();
                        // Replace dots not followed by a number with an empty string
                        return element.replace(/\.(?!\d)|[,]/g, '').trim();
                    });


                    const getList = outputArray.map((el, index) => {
                        const checkType = configrationCheck(el)
                        const finalObj = checkType ? generateObject(checkType, el, index) : generateObject('SECTION', el, index)
                        return finalObj
                    })

                    // Transforming the array of objects into a single object
                    const finalTocObj = getList.reduce((result, currentObject) => {
                        const [key] = Object.keys(currentObject);
                        const value = currentObject[key];
                        result[key] = value;
                        return result;
                    }, {});


                    const getTOCList = Object.entries(finalTocObj);


                    function convertToList(list) {
                        const newArray = [];
                        let currentObject = {};
                        list.forEach((item) => {
                            const getKey = item[0]; // Get the key of the current item
                            // const keyWithoutNumber = getKey.replace(/[0-9]/g, ''); // Remove any numbers from the key

                            if (getKey.startsWith("CHAPTER")) {
                                // If the key starts with "CHAPTER", it's a new object
                                if (Object.keys(currentObject).length !== 0) {
                                    newArray.push(currentObject); // Push the previous object to the array
                                }
                                currentObject = {}; // Reset currentObject for the new object
                            }

                            currentObject[getKey] = item[1]; // Add the key-value pair to the currentObject
                        });

                        // Push the last currentObject into newArray
                        if (Object.keys(currentObject).length !== 0) {
                            newArray.push(currentObject);
                        }

                        return newArray;
                    };


                    const finalTocArray = convertToList(getTOCList);
                   
                
                        
                
// ------------------------------------------------------------------------------------------


                    const generatedChapterData = generateChapterData(withoutTOCAllPTagData, finalTocArray)

                    // console.log("generatedChapterData===", generatedChapterData)
                    // res.status(200).send(finalTocArray);
                    // res.status(200).send(generatedChapterData);
                
                    
                
                
                // new apparoach end

                
                
                
                // if (paragraphs) {
                //     // const tocData = paragraphs.find((value) => {
                //     //     console.log({ value })
                //     //     if (value["TOC"]) {
                //     //         return value.TOC;
                //     //     }

                //     // });
                //     // console.log({ tocData })
                //     //console.log({ withoutTOC })


                //     const resultArray = [];
                //     function processPValues(data) {
                //         function recursiveProcess(data, isFirstSectP) {
                //             if (data && typeof data === 'object') {
                //                 if (Array.isArray(data)) {
                //                     for (const item of data) {
                //                         recursiveProcess(item, isFirstSectP);
                //                     }
                //                 } else {
                //                     for (const key in data) {
                //                         if (key === "P" && Array.isArray(data[key])) {
                //                             // Remove objects from "P" values
                //                             const filteredP = data[key].filter(value => typeof value !== 'object');
                //                             if (isFirstSectP) {
                //                                 resultArray.unshift(...filteredP);
                //                             } else {
                //                                 resultArray.push(...filteredP);
                //                             }
                //                         }
                //                         recursiveProcess(data[key], key === "Sect" && !isFirstSectP);
                //                     }
                //                 }
                //             }
                //         }

                //         recursiveProcess(data, false);

                //     }

                //     // console.log({ resultArray })
                //     processPValues(tocData.TOC);


                //     //Making readable table content


                //     function makingReadableTableContent(data) {
                //         const newData = data.join()
                //         //Split string from table index like 1-1
                //         let outputArray = newData.split(/(?=\d+-\d+)/);
                //         //Removing the table indexes from the array
                //         outputArray = outputArray.map(function (element) {
                //             return element.replace(/^\d+-\d+\s*/, '');
                //         }).filter((result) => result != '');

                //         //Removing the dots after the string
                //         outputArray = outputArray.map(function (element) {
                //             return element.replace(/[.]/g, '')?.trim();
                //         })
                //         return outputArray;
                //     }

                //     function makingChapter(originalArray) {
                //         let indices = []
                //         //Making seprate array fro chapter
                //         let chapters = originalArray.filter((element, index) => {
                //             if (element.includes("CHAPTER")) {
                //                 indices.push(index)
                //             }
                //             return element.includes("CHAPTER")
                //         })

                //         return {
                //             chapters,
                //             indices
                //         }
                //     }

                //     function splitArrayByIndices(indices, originalArray) {
                //         let resultArrays = [];
                //         let startIndex = indices[0];

                //         for (let index of indices) {
                //             if (index != 0) {
                //                 resultArrays.push(originalArray.slice(startIndex + 1, index));
                //             }

                //             startIndex = index;
                //         }

                //         resultArrays.push(originalArray.slice(startIndex + 1));

                //         return resultArrays;
                //     }

                //     const tableData = makingReadableTableContent(resultArray)
                //     //Making seprate array fro chapter
                //     // console.log({tableData})
                //     const { chapters, indices } = makingChapter(tableData)
                //     //Split Original array by help of the chapter indexes
                //     const updatedData = splitArrayByIndices(indices, tableData)

                //     //Preparing updated array of chapter
                //     const newAarray = []
                //     for (let i = 0; i < chapters.length; i++) {
                //         newAarray.push(
                //             {
                //                 chapter: chapters[i].replace(/,/g, ''),
                //                 sections: updatedData[i]
                //             }
                //         )
                //     }

                //     // console.log({newAarray})

                //     const tagPallData = withoutTOC["P"];
                //     const allChapterWithSection = newAarray;

                //     // console.log({ tagPallData })
                //     // Array to store matched chapters and their content
                //     const AllChapterData = [];

                //     // Variable to track the current chapter being processed
                //     let currentChapter = null;

                //     function isChapterString(str) {
                //         if (typeof str === 'string'){
                //             const trimStr = str.trim();
                //             // Define a regular expression pattern to match the desired format
                //             const pattern = /^Chapter\s*\d+\s*[^\d]+$/;

                //             // Use the test method to check if the string matches the pattern
                //             return pattern.test(trimStr);
                //         }

                //     }


                //     function extractChapter(inputString) {
                //         const trimStr = inputString.trim();
                //         // Use a regular expression to match "CHAPTER" followed by a space and one or more digits
                //         const match = trimStr.match(/\bChapter\s?(?:\d+)?[^\d]+/i);

                //         // Check if a match is found and return it, or return null if no match
                //         // console.log("inputString.match(/\bChapter(?: \d+)? [^\d]+/) ===", match ? match[0] : null)
                //         return match ? match[0] : null;
                //     }
                //     // Iterate through tagPallData
                //     tagPallData.forEach(tagData => {
                //         if (typeof tagData === 'object' && tagData._ && tagData._.startsWith('CHAPTER')) {
                //             // If it's a chapter, update the currentChapter variable
                //             currentChapter = tagData._;
                //         }else{
                //             if (isChapterString(tagData)){
                //                 if (tagData?.length < 100){
                //                     currentChapter = tagData;
                //                 }

                //             }
                //         }

                //         // Check if the currentChapter is in newArray



                //         const matchingChapter = allChapterWithSection.find(newChapter => {

                //             if (typeof newChapter.chapter === 'string' && typeof currentChapter === 'string')
                //             {
                //                 const extractedChapter = extractChapter(newChapter.chapter).toLowerCase();
                //                 const updateCurrentChapter = currentChapter?.trim().toLowerCase();
                //                 return updateCurrentChapter && extractedChapter.includes(updateCurrentChapter)
                //             }



                //         });


                //         // If a match is found, push the entire content to the AllChapterData array
                //         if (matchingChapter) {
                //             console.log({ tagData })
                //             AllChapterData.push(tagData);
                //         }
                //     });




                    // function prepareTableOfContent()  {
                    //     if (newAarray?.length > 0) {
                    //        return newAarray?.map((heading) => {
                    //             // console.log({heading})
                    //            const match = heading?.chapter.match(/\d+/);

                    //             // Extract the captured number
                    //            const chapterNumber = match ? match[0] : null;

                    //             const parts = heading?.chapter.split(/\d+/);

                    //            // Extract the part after the number
                    //             const chapterName = parts.length > 1 ? parts[1]?.trim() : null;
                    //             // const section = prepareSectionContent(heading);
                    //             const sectionData = prepareSectionContent(heading)
                    //            const sectionView = sectionData?.join('');
                    //             // console.log("SECTION VIEW =====",sectionView);
                    //            const textvalue = `<div class="toc nomark"><div class="toc_level_1"><p><span class="label">CHAPTER </span><span class="ordinal">${chapterNumber} </span><span class="text"> ${chapterName}</span><span class="locator"><a class="toc_pages" href="#VAEBC2021P1_Ch01">1-1</a></span></p><p><span class="content_left">Section</span></p><div class="toc nomark">${sectionView}</div></div></div>`

                    //             return textvalue;


                    //         })
                    //     }
                    // };

                    // console.log("prepareTableOfContent() ============>",prepareTableOfContent());

                    // function prepareSectionContent(heading) {
                    //     if (heading?.sections.length >0 ){

                    //         return heading.sections.map((sec) => {
                    //             // console.log("========+++++SECCCCC++++++++",sec)
                    //             if(sec.length > 1){
                    //                 const match = sec.match(/\b\d+\b/);
                    //                 const secNumber = match ? match[0] : "No Data";

                    //                 const secName = sec ? sec.split(/\b\d+\b/)[1]?.trim() : 'No data'

                    //                 const secValue =`<div class="toc_level_2"><p><span class="ordinal">${secNumber} </span><span class="text"> ${secName} </span><span class="locator"> <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a></span></p></div>`
                    //                 // console.log({ secValue })
                    //                 return secValue;
                    //             }

                    //         })
                    //     }
                    // }

                    // const chapterAndSectionXML = prepareTableOfContent()?.join('');

                    // console.log({ AllChapterData })
                    // const generateChapter = generateChapterSection(AllChapterData);
                    // const generatedChapter = generateAllDataArray(AllChapterData)?.join('');
                    // console.log({ generateChapter })

                    /*
                    const newArray: any = [
                        {
                            CHAPTER: "CHAPTER 1 ADMINISTRATION",
                            SECTION: "Section 1401 General",
                            PART: "PART I PARTAdmin",
                            APPENDIX: "APPENDIX CHAPTER 1",
                        },
                        {
                            CHAPTER: "CHAPTER 2 ADMINISTRATION",
                            SECTION: "Section 1401 General",
                            PART: "PART I PARTAdmin",
                            APPENDIX: "APPENDIX CHAPTER 1 appendixHeading",
                        }]
                    
                    */
                    const generatedTOC =" generateTocContent(finalTocArray).join()"
                    const finalXML = `
                    <?xml version="1.0" encoding="UTF-8"?>
                        <!DOCTYPE iccxml SYSTEM "iccxml.dtd">
                        <iccxml
                            xmlns="http://www.w3.org/1999/xhtml"
                            xmlns:epub="http://www.idpf.org/2007/ops"
                            xmlns:m="http://www.w3.org/1998/Math/MathML">
                            <head>
                                <title>{bookTitle}</title>
                                <link href="newICCStylesheet.css" rel="Stylesheet" type="text/css"/>
                            </head>
                            <body epub:type="bodymatter">
                                <section id="VAEBC2021P1" class="volume" epub:type="volume">
                                    <section id="VAEBC2021P1_frontmatter" class="frontmatter" epub:type="frontmatter">
                                        <section id="VAEBC2021P1_TOC">
                                            <nav class="table_of_contents" epub:type="toc">
                                                <h1 class="frontmatter_title" epub:type="title">TABLE OF CONTENTS</h1>
                                                ${generatedTOC}
                                            </nav>
                                        </section>
                                        ${generatedChapterData}
                                    </section>
                                </section>
                            </body>
                    </iccxml>`;
                    // console.log({ finalXML })
                    res.status(200).send(finalXML);
                    
                    
                })

            
        })

        } catch (error) {
            next(error);
        }
    };

    public viewXml = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).send("<h1>View Xml</h1>")
        } catch (error) {
            next(error);
        }
    };

}

export default PdfToXmlController;
