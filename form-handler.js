const endpoints = {
  prints: "https://script.google.com/macros/s/AKfycbzaPckAqUyHB-Xla7cW3--26SmtK2fBe_Drp1M_Uv1zRD_lVIg-ELK7GPXFYMlB8Y4Z/exec",
  decks: "https://script.google.com/macros/s/AKfycby4tWb-_Mb6JQLm2KgIA4NsITz9WftdCompnEp0YjAkQzjl9njnl5X6RzYz25Kh50Cw/exec"
};

window.oknoSetCFToken = function (token) {
  const cf = document.getElementById("cfToken");
  if (cf) cf.value = token || "";
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("order-form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const idleLabel = submitBtn ? submitBtn.textContent.trim() : "BUY";

  if (submitBtn && submitBtn.dataset.oos === "true") {
    submitBtn.textContent = "OUT OF STOCK";
    submitBtn.disabled = true;
    submitBtn.type = "button";
    form.addEventListener("submit", (e) => e.preventDefault(), true);
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const ukPostcodeInText = /\b(?:GIR ?0AA|[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const address = document.getElementById("address")?.value.trim() || "";
    const product = document.getElementById("product")?.value.trim() || "";
    const website = document.getElementById("website")?.value.trim() || "";
    const cfToken = document.getElementById("cfToken")?.value.trim() || "";
    const orderNumber = Math.floor(100000 + Math.random() * 900000);

    if (website) {
      return;
    }

    if (!emailRe.test(email)) {
      alert("Please use a real email address.");
      return;
    }
    if (!ukPostcodeInText.test(address)) {
      alert("UK orders need a full UK postcode in the address.");
      return;
    }
    if (address.length < 12) {
      alert("Please include house/flat + street and town/city with postcode.");
      return;
    }

    let succeeded = false;
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 20000);

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "SENDING…";
      }

      const response = await fetch(endpoints[form.dataset.endpoint] || endpoints.prints, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name,
          email,
          address,
          orderNumber: String(orderNumber),
          product,
          website,
          cfToken
        }),
        signal: controller.signal
      });

      const text = (await response.text()).trim();

      if (response.ok && text === "OK") {
        succeeded = true;
        window.location.href = "../thanks/";
        return;
      }

      const [code, ...detail] = text.split(":");
      const serverMessage = detail.join(":").trim();

      if (code.startsWith("ERR_")) {
        alert(serverMessage || "Sorry, something went wrong. Please try again.");
      } else {
        alert("Sorry, something went wrong. Please try again.");
      }

      try { window.turnstile?.reset?.(); } catch {}
    } catch (err) {
      console.error("Form submission failed:", err);
      alert("Sorry, something went wrong. Please try again.");
      try { window.turnstile?.reset?.(); } catch {}
    } finally {
      clearTimeout(to);
      if (!succeeded && submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = idleLabel;
      }
    }
  });
});
