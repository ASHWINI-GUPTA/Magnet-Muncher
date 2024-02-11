"use strict";

/**
 * Adds event listener to extract magnet links when the extract button is clicked.
 * Retrieves current active tab and injects content script to extract links.
 */

document.getElementById("extract").addEventListener("click", () => {
  let tabId;

  getCurrentTab()
    .then((tabs) => {
      tabId = tabs[0].id;
      return injectScript(tabId);
    })
    .then(() => {
      chrome.tabs.sendMessage(tabId, { action: "extract" }, (links) => {
        if (chrome.runtime.lastError) {
          return window.alert(chrome.runtime.lastError);
        }

        const parsedLinks = [...new Set(links)].map((link) => ({
          name: parseMagnetName(link),
          link: link,
        }));

        const listGroup = document.getElementById("parsed-links");

        parsedLinks.forEach((link) => {
          const listItem = document.createElement("div");
          listItem.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
          );

          const nameSpan = document.createElement("span");
          nameSpan.classList.add("name-span");
          nameSpan.textContent = link.name;

          const copyButton = document.createElement("button");
          copyButton.textContent = "📋";
          copyButton.classList.add("btn");
          copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(link.link);
            copyButton.textContent = "✔️";
          });

          listItem.appendChild(nameSpan);
          listItem.appendChild(copyButton);

          listGroup.appendChild(listItem);
        });
      });
    })
    .catch((error) => window.alert(error.message));
});

/**
 * Parses magnet URI to extract the name.
 *
 * @param {string} magnetURI - The magnet URI to parse.
 * @returns {string} The name extracted from the magnet URI.
 */
function parseMagnetName(magnetURI) {
  const prefix = "magnet:?xt=";
  if (!magnetURI.startsWith(prefix)) return null;

  const params = new URLSearchParams(magnetURI.slice(prefix.length));
  const dnValue = params.get("dn");

  return dnValue ? decodeURIComponent(dnValue) : null;
}

/**
 * Retrieves the current active tab of the window.
 *
 * @returns {Promise<Array<chrome.tabs.Tab>>} A promise resolving to an array containing the current active tab.
 */
function getCurrentTab() {
  return new Promise((resolve, reject) => {
    const queryInfo = { active: true, currentWindow: true };
    chrome.tabs.query(queryInfo, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(tabs);
      }
    });
  });
}

/**
 * Injects a content script into the specified tab.
 *
 * @param {number} tabId - The ID of the tab to inject the script into.
 * @returns {Promise<void>} A promise indicating the completion of script injection.
 */
function injectScript(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      { target: { tabId: tabId }, files: ["/content-script.js"] },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError));
        } else {
          resolve();
        }
      }
    );
  });
}
