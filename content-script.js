"use strict";
chrome.runtime.onMessage.addListener(onMessage);

/**
 * @function onMessage
 * @param {object} message
 * @param {runtime.MessageSender} sender
 *  Representing the sender of the message.
 * @param {function} sendResponse
 *  A function to call, at most once, to send a response to the message.
 */
function onMessage(message, sender, sendResponse) {
  if (message.action === "extract") {
    sendResponse(extractLinks());
  } else {
    throw new Error("Unknown type of message");
  }
}

/**
 * Extract magnet links.
 *
 * @function extractLinks
 */
function extractLinks() {
  const links = [];

  for (let index = 0; index < document.links.length; index++) {
    var href = document.links[index].href;
    if (href && href.startsWith("magnet:?xt=")) {
      links.push(href);
    }
  }

  return links.length ? links : null;
}
