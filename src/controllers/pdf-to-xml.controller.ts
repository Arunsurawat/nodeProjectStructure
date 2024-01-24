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
            const xmlData: string = fs.readFileSync(uploadedFile.path, 'utf-8');

            // Parse XML to JavaScript object
            xml2js.parseString(xmlData, { explicitArray: false, preserveChildrenOrder: true, mergeAttrs: false }, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                    return;
                }
                // console.log("Ressult ===============> ", JSON.stringify(result));

                const paragraphs = result['TaggedPDF-doc']["Part"];
                // console.log("JSON.stringify(paragraphs)=============", JSON.stringify(paragraphs));
                const bookAllData = result['TaggedPDF-doc'];
                const bookTitle = result['TaggedPDF-doc']["P"] ? result['TaggedPDF-doc']["P"][0]["_"] : "NO DATA";

                const tocData: TOCObject | null = findTOC(result['TaggedPDF-doc']);
                const withoutTOC: TOCObject | null = removeTOC(result['TaggedPDF-doc']);
                
                
                // console.log({toc})
                // res.status(200).send(result);
                
                if (paragraphs) {
                    // const tocData = paragraphs.find((value) => {
                    //     console.log({ value })
                    //     if (value["TOC"]) {
                    //         return value.TOC;
                    //     }

                    // });
                    console.log({ tocData })
                    console.log({ withoutTOC })


                    const resultArray = [];
                    function processPValues(data) {
                        function recursiveProcess(data, isFirstSectP) {
                            if (data && typeof data === 'object') {
                                if (Array.isArray(data)) {
                                    for (const item of data) {
                                        recursiveProcess(item, isFirstSectP);
                                    }
                                } else {
                                    for (const key in data) {
                                        if (key === "P" && Array.isArray(data[key])) {
                                            // Remove objects from "P" values
                                            const filteredP = data[key].filter(value => typeof value !== 'object');
                                            if (isFirstSectP) {
                                                resultArray.unshift(...filteredP);
                                            } else {
                                                resultArray.push(...filteredP);
                                            }
                                        }
                                        recursiveProcess(data[key], key === "Sect" && !isFirstSectP);
                                    }
                                }
                            }
                        }

                        recursiveProcess(data, false);

                    }

                    console.log({ resultArray })
                    processPValues(tocData.TOC);


                    //Making readable table content 


                    function makingReadableTableContent(data) {
                        const newData = data.join()
                        //Split string from table index like 1-1
                        let outputArray = newData.split(/(?=\d+-\d+)/);
                        //Removing the table indexes from the array
                        outputArray = outputArray.map(function (element) {
                            return element.replace(/^\d+-\d+\s*/, '');
                        }).filter((result) => result != '');

                        //Removing the dots after the string
                        outputArray = outputArray.map(function (element) {
                            return element.replace(/[.]/g, '').trim();
                        })
                        return outputArray;
                    }

                    function makingChapter(originalArray) {
                        let indices = []
                        //Making seprate array fro chapter
                        let chapters = originalArray.filter((element, index) => {
                            if (element.includes("CHAPTER")) {
                                indices.push(index)
                            }
                            return element.includes("CHAPTER")
                        })

                        return {
                            chapters,
                            indices
                        }
                    }

                    function splitArrayByIndices(indices, originalArray) {
                        let resultArrays = [];
                        let startIndex = indices[0];

                        for (let index of indices) {
                            if (index != 0) {
                                resultArrays.push(originalArray.slice(startIndex + 1, index));
                            }

                            startIndex = index;
                        }

                        resultArrays.push(originalArray.slice(startIndex + 1));

                        return resultArrays;
                    }

                    const tableData = makingReadableTableContent(resultArray)
                    //Making seprate array fro chapter
                    console.log({tableData})
                    const { chapters, indices } = makingChapter(tableData)
                    //Split Original array by help of the chapter indexes
                    const updatedData = splitArrayByIndices(indices, tableData)

                    //Preparing updated array of chapter
                    const newAarray = []
                    for (let i = 0; i < chapters.length; i++) {
                        newAarray.push(
                            {
                                chapter: chapters[i].replace(/,/g, ''),
                                sections: updatedData[i]
                            }
                        )
                    }
                    
                    console.log({newAarray})
                    function prepareTableOfContent()  {
                        if (newAarray?.length > 0) {
                           return newAarray?.map((heading) => {
                                // console.log({heading})
                               const match = heading?.chapter.match(/\d+/);

                                // Extract the captured number
                               const chapterNumber = match ? match[0] : null;
                                
                                const parts = heading?.chapter.split(/\d+/);

                               // Extract the part after the number
                                const chapterName = parts.length > 1 ? parts[1].trim() : null;
                                // const section = prepareSectionContent(heading);
                                const sectionData = prepareSectionContent(heading)
                               const sectionView = sectionData?.join('');
                                // console.log("SECTION VIEW =====",sectionView);
                               const textvalue = `<div class="toc nomark"><div class="toc_level_1"><p><span class="label">CHAPTER </span><span class="ordinal">${chapterNumber} </span><span class="text"> ${chapterName}</span><span class="locator"><a class="toc_pages" href="#VAEBC2021P1_Ch01">1-1</a></span></p><p><span class="content_left">Section</span></p><div class="toc nomark">${sectionView}</div></div></div>`
                                                                
                                return textvalue;

                                
                            })
                        }
                    };
                    
                    // console.log("prepareTableOfContent() ============>",prepareTableOfContent());

                    function prepareSectionContent(heading) {
                        if (heading?.sections.length >0 ){
                            
                            return heading.sections.map((sec) => {
                                // console.log("========+++++SECCCCC++++++++",sec)
                                if(sec.length > 1){
                                    const match = sec.match(/\b\d+\b/);
                                    const secNumber = match ? match[0] : "No Data";

                                    const secName = sec ? sec.split(/\b\d+\b/)[1].trim() : 'No data'

                                    const secValue =`<div class="toc_level_2"><p><span class="ordinal">${secNumber} </span><span class="text"> ${secName} </span><span class="locator"> <a class="toc_pages" href="#VAEBC2021P1_Ch01_Sec101">1-1</a></span></p></div>`
                                    // console.log({ secValue })
                                    return secValue;
                                }
                                
                            })
                        }
                    }
                    
                    const chapterAndSectionXML = prepareTableOfContent()?.join('');

                    const finalXML = `
                    <?xml version="1.0" encoding="UTF-8"?>
                        <!DOCTYPE iccxml SYSTEM "iccxml.dtd">
                        <iccxml
                            xmlns="http://www.w3.org/1999/xhtml"
                            xmlns:epub="http://www.idpf.org/2007/ops"
                            xmlns:m="http://www.w3.org/1998/Math/MathML">
                            <head>
                                <title>${bookTitle}</title>
                                <link href="newICCStylesheet.css" rel="Stylesheet" type="text/css"/>
                            </head>
                            <body epub:type="bodymatter">
                                <section id="VAEBC2021P1" class="volume" epub:type="volume">
                                    <section id="VAEBC2021P1_frontmatter" class="frontmatter" epub:type="frontmatter">
                                        <section id="VAEBC2021P1_TOC">
                                            <nav class="table_of_contents" epub:type="toc">
                                                <h1 class="frontmatter_title" epub:type="title">TABLE OF CONTENTS</h1>
                                                ${chapterAndSectionXML}
                                            </nav>
                                        </section>
                                    </section>
                                </section>
                            </body>
                    </iccxml>`;
                    console.log({ finalXML })
                    res.status(200).send(finalXML);

                    
                }

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
