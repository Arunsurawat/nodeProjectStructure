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
import { configrationCheck, configrationSetBookName, getAllPTagData } from "@/helper/common";
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
            // console.log("REQ FILE 2 ========", req.file);
            const uploadedFile = req.file as UploadedFile;
            // console.log({ uploadedFile })
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
                // let modifiedData = data.replace(/<\s*(\/)?\s*(H[1-6])(\s+[^>]*)?>/g, (match, p1, p2) => {
                //     if (p1 === '/') {
                //         return '</P>'; // Closing tag
                //     } else {
                //         return '<P>'; // Opening tag
                //     }
                // });
                // Replace <H1>, <H2>, <H3>, <H4>, <H5>, and <H6>, <P>, <L>, <LI>, <Lbl>, and <LBody> tags
                let modifiedData = data.replace(/<\s*(\/)?\s*(H[1-6]|Lbl|LBody|Div)(\s+[^>]*)?>/g, (match, p1, p2) => {
                    if (p1 === '/') {
                        return '</P>'; // Closing tag
                    } else {
                        return '<P>'; // Opening tag
                    }
                });
                // Remove the <Part> and </Part> tags 
                modifiedData = modifiedData.replace(/<Part>(.*?)<\/Part>/gs, '$1');


                // Remove the <Sect> and </Sect> tags and <Sect />
                // const pattern = /<Sect\s*\/?>|<\/Sect>/g;
                const pattern = /<Sect\s*\/?>|<\/Sect>|<L\s*\/?>|<\/L>|<LI\s*\/?>|<\/LI>/g;

                modifiedData = modifiedData.replace(pattern, '');

                
                modifiedData = modifiedData.replace(/(CHAPTER|APPENDIX)(\d+|\w+)/g, function (match, p1, p2) {
                    // If p2 is a number, add a space before any single digit
                    if (!isNaN(p2)) {
                        return p1 + ' ' + p2.replace(/\b(\d)\b(?!\d)/g, '$1');
                    } else {
                        // If p2 is not a number, it's a word
                        return p1 + ' ' + p2;
                    }
                });

                
           
            
            
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
                   
                    const bookName = configrationSetBookName(withoutTOCAllPTagData); 

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
                    console.log({ outputArray })
                    outputArray = outputArray.length > 0 && outputArray.map(function (element) {
                        // Remove periods and commas from the result
                        element = element.replace("TABLE OF CONTENTS ", "").trim();
                        element = element.replace(/\.(?!\d)|[,]/g, '').trim();
                        // remove Book name in list
                        element = element.replace((bookName).toUpperCase(), "")
                        return element

                        
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


                    // function convertToList(list) {
                    //     const newArray = [];
                    //     let currentObject = {};
                    //     list.forEach((item) => {
                    //         const getKey = item[0]; // Get the key of the current item
                    //         // const keyWithoutNumber = getKey.replace(/[0-9]/g, ''); // Remove any numbers from the key

                    //         if (getKey.startsWith("CHAPTER")) {
                    //             // If the key starts with "CHAPTER", it's a new object
                    //             if (Object.keys(currentObject).length !== 0) {
                    //                 newArray.push(currentObject); // Push the previous object to the array
                    //             }
                    //             currentObject = {}; // Reset currentObject for the new object
                    //         }

                    //         currentObject[getKey] = item[1]; // Add the key-value pair to the currentObject
                    //     });

                    //     // Push the last currentObject into newArray
                    //     if (Object.keys(currentObject).length !== 0) {
                    //         newArray.push(currentObject);
                    //     }

                    //     return newArray;
                    // };

                    
                    function convertToList(list) {
                        const newArray = [];
                        let currentObject = {};
                        let currentStr = 'CHAPTER'
                        list.forEach((item) => {
                            const getKey = item[0]; // Get the key of the current item
                            // const keyWithoutNumber = getKey.replace(/[0-9]/g, ''); // Remove any numbers from the key

                            if (getKey.startsWith("CHAPTER") && currentStr == 'CHAPTER') {
                                currentStr = 'CHAPTER'
                                if (Object.keys(currentObject).length !== 0) {
                                    newArray.push(currentObject);
                                }
                                currentObject = {};
                            } else if (getKey.startsWith("APPENDIX")) {
                                currentStr = 'APPENDIX'

                                if (Object.keys(currentObject).length !== 0) {
                                    newArray.push(currentObject);
                                }
                                currentObject = {};

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


                const generatedChapterData:any = generateChapterData(withoutTOCAllPTagData, finalTocArray)

                // console.log("generatedChapterData===", generatedChapterData)
                // res.status(200).send(finalTocArray);
                // res.status(200).send(generatedChapterData);
                
                    
                
                
                // new apparoach end

                
                    const generatedTOC =generateTocContent(finalTocArray).join();
                    // console.log("*******************", generatedChapterData)
                    // const snatizeXml = generatedChapterData && generatedChapterData.forEach(element => {
                    //     return element.unescapeXml;
                    // });
                    const finalXML = `
                    <?xml version="1.0" encoding="UTF-8"?>
                        <!DOCTYPE iccxml SYSTEM "iccxml.dtd">
                        <iccxml
                            xmlns="http://www.w3.org/1999/xhtml"
                            xmlns:epub="http://www.idpf.org/2007/ops"
                            xmlns:m="http://www.w3.org/1998/Math/MathML">
                            <head>
                                <title>${bookName}</title>
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
