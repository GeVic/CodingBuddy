import {
  OpenAIStream,
  OpenAIStreamPayload,
  PayloadObject,
} from "../../utils/OpenAIStream";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { prompt, selected } = (await req.json()) as {
    prompt?: string;
    selected?: string;
  };

  if (!prompt) {
    return new Response(
      "💬 Type a description to get the git command you need.",
    );
  }

  if (
    prompt.length >= 100 &&
    selected!.toLowerCase() !== "format" &&
    selected!.toLowerCase() !== "types"
  ) {
    return new Response(
      "🚨 The description is too large for the ChatGPT API. Try reducing the number of characters.",
    );
  }

  const payloadGit: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a Senior Frontend developer. I want you to only reply with git command the output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless. Give me the git command that would do the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const payloadLinux: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a Linux expert. I want you to only reply with linux command the output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless. Give me the linux command that would do the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const payloadMacOS: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a mac-os expert. I want you to only reply with mac-os command or keyboard shortcuts output inside one unique block, and nothing else. Do not write explanations. Do not type keyboard shortcuts unless. Give me mac-os command or the keyboard shortcuts that would do the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const payloadWindows: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a windows expert. I want you to only reply with windows command or keyboard shortcuts the output inside one unique block, and nothing else. Do not write explanations. Do not type commands or keyboard shortcuts unless. Give me the windows command or keyboard shortcuts that would do the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const payloadFormatObject: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a Senior Software developer. I want you to only reply with formatted code output inside one unique code block, and nothing else. Do not write explanations. Do not type formatted code unless. Give me the properly formatted object for the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const payloadGenType: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a Senior Software developer. I want you to only reply with typed code output inside one unique code block, and nothing else. Do not write explanations. Do not type typed code unless. Give me the types for the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const payloadWitty: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a Comdian. I want you to only reply with witty response output inside one unique code block, and nothing else. Do not write explanations. Do not type typed witty response unless. Give me the witty response for the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const payloadNames: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `I want you to act as a Senior Software developer. I want you to only reply with suitable function or class or variable name output inside one unique code block, and nothing else. Do not write explanations. Do not type name unless. Give me the suitable name for the following: ${prompt}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

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

  const stream = await OpenAIStream(
    apiPayload.find((item) => item.key === selected)!.payload,
    selected!,
  );

  return new Response(stream);
};

export default handler;
