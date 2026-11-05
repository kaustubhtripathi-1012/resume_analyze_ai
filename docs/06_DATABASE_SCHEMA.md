# Database Schema
MongoDB collections (shown as tables for readability). `_id` ObjectId is the primary key; `createdAt/updatedAt` added by Mongoose timestamps.

## Table: users
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key |
| name | string | required |
| email | string | unique, lowercase |
| passwordHash | string | bcrypt |
| role | enum | candidate | recruiter | admin |
| isActive | boolean | default true |
| visibleToRecruiters | boolean | candidate opt-in |

## Table: resumes
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key |
| userId | ObjectId | ref users |
| fileName | string | original name |
| filePath | string | private storage path |
| fileType | enum | pdf | docx |
| rawText | string | extracted text |
| parsed | object | name, email, phone, skills[], education[], experience[], projects[] |
| status | enum | uploaded | parsing | parsed | failed |

## Table: analyses
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key |
| resumeId | ObjectId | ref resumes |
| jobId | ObjectId | nullable, ref jobs |
| atsScore | number | 0-100 |
| breakdown | object | format, keywords, sections, readability, length |
| matchPercent | number | nullable |
| matchedSkills | string[] |  |
| missingSkills | string[] |  |
| suggestions | string[] |  |
| status | enum | pending | done | failed |

## Table: jobs
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key |
| postedBy | ObjectId | ref users |
| title | string |  |
| company | string |  |
| description | string |  |
| requiredSkills | string[] |  |
| location | string |  |
| experienceLevel | enum | fresher | junior | mid | senior |
| isActive | boolean | default true |

## Table: recommendations
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key |
| resumeId | ObjectId | ref resumes |
| items | array | {jobId, matchPercent, reason} |
| generatedAt | date | cache timestamp |

## Table: skills
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key |
| name | string | unique canonical |
| aliases | string[] | e.g. JS, javascript |
| category | string | language, framework, tool, soft |

## Table: auditLogs
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | primary key |
| actorId | ObjectId | ref users |
| action | string |  |
| target | string |  |
| meta | object |  |

## Relationships
- users 1-N resumes; resumes 1-N analyses; jobs 1-N analyses (optional).
- resumes 1-1 recommendations (latest).
- users (recruiter) 1-N jobs.
- skills referenced by name from parsed.skills and jobs.requiredSkills.

## Indexes
- users.email unique
- resumes.userId, analyses.resumeId + createdAt desc
- jobs: text index on title+description; index on isActive, requiredSkills
- skills.name unique; skills.aliases

## Migration rules
- Use versioned migration scripts (migrate-mongo) for index/data changes.
- Never edit a released migration; add a new one.
- Seed script loads the skills taxonomy and demo admin.
- Back up before running migrations in production.
