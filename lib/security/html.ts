import sanitizeHtml from "sanitize-html";

export const sanitizeContentHtml = (value: string) => sanitizeHtml(value, {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
  allowedAttributes: { a: ["href", "title"], img: ["src", "alt", "width", "height"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
});
export const serializeInlineJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
