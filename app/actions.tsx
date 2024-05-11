"use server";

import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";

import { tool } from "ai";
import OpenAI from "openai";
import { z } from "zod";

const GPT_3 = "gpt-3.5-turbo";

const GPT_4 = "gpt-4-turbo";

const openAI = new OpenAI();

export async function continueConversation(messages: CoreMessage[]) {
  "use server";
  const data = { imageUrl: "" };

  const imgStream = createStreamableUI(<p>loading...</p>);

  const result = await streamText({
    model: openai(GPT_3),
    messages,
    tools: {
      textToImage: tool({
        description:
          "Takes a text description of an image and returns a url to an image matching the description",
        parameters: z.object({
          image_description: z
            .string()
            .describe(
              "The text description of an image that will be generated"
            ),
        }),
        execute: async ({ image_description }) => {
          console.log("hererere");
          try {
            const response = await openAI.images.generate({
              prompt: image_description,
              model: "dall-e-3",
              n: 1,
              size: "1024x1024",
            });

            console.log("response", response);

            const imageUrl = response.data[0].url;

            console.log("action called image url here", imageUrl);
            if (imageUrl) {
              console.log("has image url", imageUrl);

              data.imageUrl = imageUrl ?? "";

              // eslint-disable-next-line @next/next/no-img-element
              imgStream.done(<img src={imageUrl} alt="generated image"></img>);

              return `imageUrl: ${imageUrl}`;
            }

            imgStream.done(<div>no image</div>);

            return "couldn't generate image";
          } catch (error) {
            console.error("error", error);

            imgStream.done(<div>no image</div>);

            return `couldn't generate image ${error}`;
          }
        },
      }),
    },
  });

  const stream = createStreamableValue(result.textStream);

  return { message: stream.value, image: imgStream.value };
}
