export function generateAllDataArray(chapterArray:any) {
  // Regular expressions to identify chapters, sections, subsections, and parts
  const chapterRegex = /^CHAPTER (\d+)\s*(.*)/;
  const sectionRegex = /^SECTION (\d+)\s*(.*)/;
  const subSectionRegex = /^(\d+)\.(\d+)\s*(.*)/;
  const partRegex = /^PART (\d+)\s*(.*)/;
  const userNoteRegex = /^User note[s]?:\s*(.+)/i;

  // Result array to store chapters and their corresponding sections, subsections, and parts
  const resultArray = [];

  let currentChapter = null;

  // Helper function to create a new chapter object
  const createNewChapter = (chapterNumber, chapterName) => ({
    chapter: chapterNumber,
    chapterHeading: chapterName,
    userNote: "",
    parts: [],
    sections: [],
    subSections: [],
  });

  // Iterate through the chapterArray
  chapterArray.forEach((line, index) => {
    const chapterHeadingInNextLine = line.match(chapterRegex)
      ? chapterArray[index + 1]
      : "no data";
    const chapterMatch = line.match(chapterRegex);
    const sectionMatch = line.match(sectionRegex);
    const subSectionMatch = line.match(subSectionRegex);
    const partMatch = line.match(partRegex);
    const userNoteMatch = line.match(userNoteRegex) && chapterArray[index + 1];

    if (chapterMatch) {
      // If a chapter is found, create a new chapter object
      currentChapter = parseInt(chapterMatch[1]);
      const currentChapterName = chapterMatch[2].trim()
        ? chapterMatch[2].trim()
        : chapterHeadingInNextLine;
      resultArray.push(createNewChapter(currentChapter, currentChapterName));
    } else if (sectionMatch && currentChapter !== null) {
      // If a section is found and a currentChapter is set, add the section to the result
      const currentSection = {
        number: parseInt(sectionMatch[1]),
        heading: sectionMatch[2].trim(),
      };
      resultArray[resultArray.length - 1].sections.push(currentSection);
    } else if (subSectionMatch && currentChapter !== null) {
      // If a subsection is found and a currentChapter is set, add the subsection to the result
      const currentSubSection = {
        number: parseInt(subSectionMatch[1]),
        heading: subSectionMatch[3].trim(),
      };
      resultArray[resultArray.length - 1].subSections.push(currentSubSection);
    } else if (partMatch && currentChapter !== null) {
      // If a part is found and a currentChapter is set, add the part to the result
      const currentPart = {
        number: parseInt(partMatch[1]),
        heading: partMatch[2].trim(),
      };
      resultArray[resultArray.length - 1].parts.push(currentPart);
    } else if (userNoteMatch && currentChapter !== null) {
      // If a user note is found and a currentChapter is set, update the userNote for the current chapter
      resultArray[resultArray.length - 1].userNote = userNoteMatch.trim();
    }
  });

    // console.log(resultArray);
    //   return resultArray;
  
  return resultArray?.length > 0 && resultArray.map((currentChapter, index) => {
    const generatedUserNotes = generateUserNotes(currentChapter);
    const generatedPartsData = generateParts(currentChapter);
    const generatedSections = generateSections(currentChapter);
    const generatedSubSections = generateSubSections(currentChapter);


    return `<section id="VAEBC2021P1_Ch01" class="chapter" epub:type="chapter">
				<header>
					<h1 class="chapter" epub:type="title">
						<span class="label" epub:type="label">CHAPTER</span>
						<span class="chapter_number" epub:type="ordinal">${currentChapter.chapter}</span>
						<br />
						<span class="chapter_title" epub:type="title"> ${currentChapter.chapterHeading}</span>
					</h1>
				</header>
                ${generatedUserNotes}   
                ${generatedPartsData}         
				<section id="VAEBC2021P1_Ch01_Sec101" class="level1">
					${generatedSections}
					<section id="VAEBC2021P1_Ch01_Sec101.1" class="level2">
					${generatedSubSections}
					</section>
				</section>
			</section>`;
  })
}


function generateUserNotes(currentChapter){
    if(currentChapter.userNote){
        return `<p>
                    <span class="label">User note:</span>
                    <span class="formal_usage">${currentChapter.userNote}</span>
                </p>`
    }
}


function generateParts(currentChapter) {
  if (currentChapter?.parts?.length > 0) {
    return currentChapter.parts.map((part,index) => {
        return `<p>
                <span class="label">PART ${part.number}</span>
                <span class="formal_usage">${part.heading}</span>
            </p>`;
    })
    
  }else{
    return ''
  }
}

function generateSections(currentChapter) {
  if (currentChapter.sections?.length > 0) {
    return currentChapter.sections.map((data, index) => {
      return `<h1 class="level1">
                <span class="label" epub:type="label">SECTION</span>
                <span class="section_number" epub:type="ordinal">${data.number}</span>
                <br />
                <span class="level1_title" epub:type="title">${data.heading}</span>
            </h1>`;
    });
  }
}

function generateSubSections(currentChapter) {
  if (currentChapter.subSections?.length > 0) {
    return currentChapter.subSections.map((data, index) => {
      return `<h1 class="level2">
                <span class="section_number" epub:type="ordinal">${data.number}</span>
                <span class="level2_title" epub:type="title">${data.heading}.</span>
            </h1>`;
    });
  }
}