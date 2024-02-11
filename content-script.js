"use strict";

/**
 * Listens for messages from the extension and performs actions accordingly.
 *
 * @param {object} message - The message received from the extension.
 * @param {runtime.MessageSender} sender - The sender of the message.
 * @param {function} sendResponse - A function to send a response to the message.
 */
function onMessage(message, sender, sendResponse) {
  if (message.action === "extract") {
    sendResponse(extractMagnetLinks());
  } else {
    throw new Error("Unknown type of message");
  }
}

/**
 * Extracts magnet links from the current document.
 *
 * @returns {Array<string>} An array containing the extracted magnet links, if any.
 */
function extractMagnetLinks() {
  const magnetLinks = [];

  for (const link of document.links) {
    const href = link.href;
    if (href && href.startsWith("magnet:?xt=")) {
      magnetLinks.push(href);
    }
  }

  return magnetLinks.length ? magnetLinks : null;
}

chrome.runtime.onMessage.addListener(onMessage);