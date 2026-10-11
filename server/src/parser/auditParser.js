const BinaryReader = require('./binaryReader');

/**
 * Parses SumTran.900 to extract user activity information.
 * 
 * SumTran.900 contains user session data:
 *   username
 *   session_uuid
 * 
 * In groups of username pairs + session IDs.
 */
class AuditParser {
  constructor() {
    this.UUID_REGEX = /^[Jj]?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
    this.USERNAME_REGEX = /^[a-zA-Z][a-zA-Z\s.]{1,28}$/;
  }

  /**
   * Parse SumTran.900 and extract user activity records.
   */
  async parse(filePath) {
    const reader = new BinaryReader(filePath);

    // SumTran.900 is small enough to read all at once (~7.5MB)
    const strings = await reader.readAllStrings(3);

    const activities = [];
    const userCounts = new Map();

    for (let i = 0; i < strings.length; i++) {
      const str = strings[i].trim();

      // Look for username + session UUID pattern
      if (this.USERNAME_REGEX.test(str) && !this.UUID_REGEX.test(str)) {
        const username = str;

        // Count user occurrences
        const count = (userCounts.get(username.toUpperCase()) || 0) + 1;
        userCounts.set(username.toUpperCase(), count);

        // Look ahead for session UUID
        let sessionId = null;
        for (let j = i + 1; j < Math.min(i + 4, strings.length); j++) {
          if (this.UUID_REGEX.test(strings[j])) {
            sessionId = strings[j].replace(/^[Jj]/, '');
            break;
          }
        }

        activities.push({
          username,
          sessionId,
          activityType: 'Session'
        });
      }
    }

    // Deduplicate to unique user sessions
    const uniqueActivities = [];
    const seen = new Set();
    for (const act of activities) {
      const key = `${act.username.toUpperCase()}_${act.sessionId || 'none'}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueActivities.push(act);
      }
    }

    return { activities: uniqueActivities, userCounts };
  }
}

module.exports = AuditParser;
