export type SkillName = {
  name: string;
}

export type ApplicationMessage = {
  message: string;
  error: string;
}

export type JWTPayload = {
  access_token: string,
  legacy_token: string;
  user_id: number;
  email: string;
  permissions?: string[];
  iss: string;
}

export type TransformedSkills = {
  matchedSource: string;
  canonicalName: string;
}

export type Skill = {
  canonicalName: string;
  matchedSource: string [];
}

export type SkillsResponse = {
  skillsTaxonomyVersion: string;
  skills: Skill[];
}

export type DefinitionObject = {
  definition: {
    "xml:lang": string;
    type: string;
    value: string;
  };
}