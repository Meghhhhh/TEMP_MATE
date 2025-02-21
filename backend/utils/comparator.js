import { GoogleGenerativeAI } from "@google/generative-ai";
  
  const apiKey = process.env.GEMINI_API_KEY_INTV;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  export async function runcomp(prompt) {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "{\n    \"prompt\":\"Company1:google salary:40lpa Company2:amazon salary:42lpa\"\n}\n\ni will provide input like this and you give o/p as:\nYou are an AI trained to compare job offers between two companies.  \nYour task is to generate structured JSON responses comparing salary growth, job security, and work-life balance.  \nEnsure the response follows this format:\n\n{\n  \"salaryGrowth\": [\n    { \"year\": \"2022\", \"Company1\": 12, \"Company2\": 15 },\n    { \"year\": \"2023\", \"Company1\": 14, \"Company2\": 18 },\n    { \"year\": \"2024\", \"Company1\": 16, \"Company2\": 20 }\n  ],\n  \"jobSecurity\": [\n    { \"metric\": \"Layoffs\", \"Company1\": 3, \"Company2\": 8 },\n    { \"metric\": \"Growth\", \"Company1\": 7, \"Company2\": 6 },\n    { \"metric\": \"Work-Life Balance\", \"Company1\": 8, \"Company2\": 7 }\n  ],\n  \"summary\": \"Company1 offers better work-life balance, while Company2 provides slightly higher salary growth. Choose based on your priorities!\"\n}\n\nUse the following rules:  \n1. Accept two company names and salary package as input.  \n2. Generate salary growth data for the past 3 years.  \n3. Provide job security metrics based on layoffs, company growth, and work-life balance.  \n4. Write a concise summary highlighting the strengths of each company.  \n5. Keep the output clean, structured, and formatted in JSON.  \n\n### **Example Input:**  \n\"Compare job offers between Google and Amazon with a salary of $150,000.\"  \n\n### **Example Output:**  \n{\n  \"salaryGrowth\": [\n    { \"year\": \"2022\", \"Google\": 12, \"Amazon\": 15 },\n    { \"year\": \"2023\", \"Google\": 14, \"Amazon\": 18 },\n    { \"year\": \"2024\", \"Google\": 16, \"Amazon\": 20 }\n  ],\n  \"jobSecurity\": [\n    { \"metric\": \"Layoffs\", \"Google\": 3, \"Amazon\": 8 },\n    { \"metric\": \"Growth\", \"Google\": 7, \"Amazon\": 6 },\n    { \"metric\": \"Work-Life Balance\", \"Google\": 8, \"Amazon\": 7 }\n  ],\n  \"summary\": \"Google offers better work-life balance, while Amazon provides slightly higher salary growth. Choose based on your priorities!\"\n}\n\nNow, generate a structured response for the given companies.\n"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"salaryGrowth\": [\n    { \"year\": \"2022\", \"google\": 12, \"amazon\": 15 },\n    { \"year\": \"2023\", \"google\": 14, \"amazon\": 18 },\n    { \"year\": \"2024\", \"google\": 16, \"amazon\": 20 }\n  ],\n  \"jobSecurity\": [\n    { \"metric\": \"Layoffs\", \"google\": 3, \"amazon\": 8 },\n    { \"metric\": \"Growth\", \"google\": 7, \"amazon\": 6 },\n    { \"metric\": \"Work-Life Balance\", \"google\": 8, \"amazon\": 7 }\n  ],\n  \"summary\": \"Google offers better work-life balance, while Amazon provides slightly higher salary growth. Choose based on your priorities!\"\n}\n```\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "return response strictly in form on json object"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"salaryGrowth\": [\n    {\n      \"year\": \"2022\",\n      \"google\": 12,\n      \"amazon\": 15\n    },\n    {\n      \"year\": \"2023\",\n      \"google\": 14,\n      \"amazon\": 18\n    },\n    {\n      \"year\": \"2024\",\n      \"google\": 16,\n      \"amazon\": 20\n    }\n  ],\n  \"jobSecurity\": [\n    {\n      \"metric\": \"Layoffs\",\n      \"google\": 3,\n      \"amazon\": 8\n    },\n    {\n      \"metric\": \"Growth\",\n      \"google\": 7,\n      \"amazon\": 6\n    },\n    {\n      \"metric\": \"Work-Life Balance\",\n      \"google\": 8,\n      \"amazon\": 7\n    }\n  ],\n  \"summary\": \"Google offers better work-life balance, while Amazon provides slightly higher salary growth. Choose based on your priorities!\"\n}\n```"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "dont put /n such things in reposne just plain json obejct"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"salaryGrowth\": [\n    { \"year\": \"2022\", \"google\": 12, \"amazon\": 15 },\n    { \"year\": \"2023\", \"google\": 14, \"amazon\": 18 },\n    { \"year\": \"2024\", \"google\": 16, \"amazon\": 20 }\n  ],\n  \"jobSecurity\": [\n    { \"metric\": \"Layoffs\", \"google\": 3, \"amazon\": 8 },\n    { \"metric\": \"Growth\", \"google\": 7, \"amazon\": 6 },\n    { \"metric\": \"Work-Life Balance\", \"google\": 8, \"amazon\": 7 }\n  ],\n  \"summary\": \"Google offers better work-life balance, while Amazon provides slightly higher salary growth. Choose based on your priorities!\"\n}\n```"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
    return result.response.text();
  }
  
  //runcomp(prompt);