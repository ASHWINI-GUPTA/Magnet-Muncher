"use strict";

document.getElementById("extract").addEventListener("click", () => {
  var tabId;

  return getCurrentTab()
    .then((items) => {
      tabId = items[0].id;
      return injectScript(tabId);
    })
    .then((item) => {
      chrome.tabs.sendMessage(tabId, { action: "extract" }, (links) => {
        if (chrome.runtime.lastError) {
          return window.alert(chrome.runtime.lastError);
        }

        const parsedLinks = [...new Set(links)].map((x) => ({
          name: parseMagnetURI(x),
          link: x,
        }));

        const listGroup = document.getElementById("parsed-links");

        parsedLinks.forEach((link) => {
          // Create list item
          const listItem = document.createElement("div");
          listItem.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
          );

          // Create span for displaying the name
          const nameSpan = document.createElement("span");
          nameSpan.classList.add("name-span");
          nameSpan.textContent = link.name;

          // Create button for copying the link
          const copyButton = document.createElement("button");
          copyButton.textContent = "📋";
          copyButton.classList.add("btn");
          copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(link.link);
            copyButton.textContent = "✔️";
          });

          // Append elements to list item
          listItem.appendChild(nameSpan);
          listItem.appendChild(copyButton);

          // Append list item to list group
          listGroup.appendChild(listItem);
        });
      });
    })
    .catch((error) => window.alert(error.message));
});

/**
 * Get name from magnet links
 *
 * @function parseMagnetURI
 * @param {string} magnetURI -- The magnet URI
 */
function parseMagnetURI(magnetURI) {
  const prefix = "magnet:?xt=";
  if (!magnetURI.startsWith(prefix)) return null;

  const params = new URLSearchParams(magnetURI.slice(prefix.length));
  const dnValue = params.get("dn");

  return dnValue ? decodeURIComponent(dnValue) : null;
}

/**
 * Get active tab of current window.
 *
 * @function getCurrentTab
 */
function getCurrentTab() {
  return new Promise((res, rej) => {
    const queryInfo = {
      active: true,
      currentWindow: true,
    };

    chrome.tabs.query(queryInfo, (items) => passNext(items, res, rej));
  });
}

/**
 * Inject script into tab
 *
 * @function injectScript
 * @param {number} tabId -- The ID of tab.
 * @param {string} file -- Pathname of script
 */
function injectScript(tabId, file = "/content-script.js") {
  return new Promise((res, rej) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [file],
      },
      (item) => passNext(item, res, rej)
    );
  });
}

/**
 * @function passNext
 * @param {*} result
 * @param {function} fulfill
 * @param {function} reject
 */
function passNext(result, fulfill, reject) {
  if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
  return fulfill(result);
}
