import { PayloadObject } from "./definition";

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str: string, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export const structurePayload = (prompt: string, selected: string) => {
  if (!prompt) {
    return "💬 Type a description to get the git command you need.";
  }

  if (
    prompt.length >= 100 &&
    selected!.toLowerCase() !== "format" &&
    selected!.toLowerCase() !== "types"
  ) {
    return "🚨 The description is too large for the ChatGPT API. Try reducing the number of characters.";
  }

  const payloadGit = `I want you to act as a Senior Frontend developer. I want you to only reply with git command the output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless. Give me the git command that would do the following: ${prompt}`;
  const payloadLinux = `I want you to act as a Linux expert. I want you to only reply with linux command the output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless. Give me the linux command that would do the following: ${prompt}`;
  const payloadMacOS = `I want you to act as a mac-os expert. I want you to only reply with mac-os command or keyboard shortcuts output inside one unique block, and nothing else. Do not write explanations. Do not type keyboard shortcuts unless. Give me mac-os command or the keyboard shortcuts that would do the following: ${prompt}`;
  const payloadWindows = `I want you to act as a windows expert. I want you to only reply with windows command or keyboard shortcuts the output inside one unique block, and nothing else. Do not write explanations. Do not type commands or keyboard shortcuts unless. Give me the windows command or keyboard shortcuts that would do the following: ${prompt}`;
  const payloadFormatObject = `I want you to act as a Senior Software developer. I want you to only reply with formatted code output inside one unique code block, and nothing else. Do not write explanations. Do not type formatted code unless. Give me the properly formatted object for the following: ${prompt}`;
  const payloadGenType = `I want you to act as a Senior Software developer. I want you to only reply with typed code output inside one unique code block, and nothing else. Do not write explanations. Do not type typed code unless. Give me the types for the following: ${prompt}`;
  const payloadWitty = `I want you to act as a Comdian. I want you to only reply with witty response output inside one unique code block, and nothing else. Do not write explanations. Do not type typed witty response unless. Give me the witty response for the following: ${prompt}`;
  const payloadNames = `I want you to act as a Senior Software developer. I want you to only reply with suitable function or class or variable name output inside one unique code block, and nothing else. Do not write explanations. Do not type name unless. Give me the suitable name for the following: ${prompt}`;

  const apiPayload: PayloadObject[] = [
    { key: "git", payload: payloadGit },
    { key: "funny", payload: payloadWitty },
    { key: "format", payload: payloadFormatObject },
    { key: "types", payload: payloadGenType },
    { key: "names", payload: payloadNames },
    { key: "linux", payload: payloadLinux },
    { key: "macos", payload: payloadMacOS },
    { key: "window", payload: payloadWindows },
  ];

  return apiPayload.find((item) => item.key === selected)!.payload;
};
