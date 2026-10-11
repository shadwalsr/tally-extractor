const BinaryReader = require('./binaryReader');

/**
 * Parses AddlCmp.900 to extract company information and configuration.
 * 
 * AddlCmp.900 contains audit standards, company schedules, and report templates.
 */
class CompanyParser {
  /**
   * Parse AddlCmp.900 and extract company information.
   */
  async parse(filePath) {
    const reader = new BinaryReader(filePath);
    const strings = await reader.readAllStrings(3);

    const info = {
      auditReports: [],
      schedules: [],
      configurations: [],
      companyReferences: [],
      financialYears: []
    };

    for (let i = 0; i < strings.length; i++) {
      const str = strings[i].trim();

      // Extract audit report content
      if (str.includes('Balance Sheet') || str.includes('Profit and Loss') || str.includes('cash flow')) {
        info.auditReports.push(str);
      }

      // Extract company name references
      if (str.includes('VENTURES') || str.includes('LIMITED') || str.includes('PVT') || str.includes('LTD')) {
        if (!info.companyReferences.includes(str)) {
          info.companyReferences.push(str);
        }
      }

      // Extract financial year references (31-Mar-YYYY pattern)
      const fyMatch = str.match(/31-Mar-(\d{4})/g);
      if (fyMatch) {
        for (const fy of fyMatch) {
          if (!info.financialYears.includes(fy)) {
            info.financialYears.push(fy);
          }
        }
      }

      // Extract schedule/configuration names
      if (str.startsWith('SchVI') || str.startsWith('AE ') || str.includes('Schedule')) {
        info.schedules.push(str);
      }
    }

    // Deduplicate
    info.auditReports = [...new Set(info.auditReports)];
    info.schedules = [...new Set(info.schedules)];

    return info;
  }
}

module.exports = CompanyParser;
