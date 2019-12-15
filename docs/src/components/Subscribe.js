import React from "react";
import styles from "./Subscribe.module.css";

const embed = `
<link href="//cdn-images.mailchimp.com/embedcode/horizontal-slim-10_7.css" rel="stylesheet" type="text/css">
<div id="mc_embed_signup">
<form action="https://qawolf.us4.list-manage.com/subscribe/post?u=1c908d7eb5441b96c6ebb55ea&amp;id=cd866aa4f3" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
    <div id="mc_embed_signup_scroll">
	<label for="mce-EMAIL">Get updates on new features and tutorials!</label>
	<input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required>
    <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_1c908d7eb5441b96c6ebb55ea_cd866aa4f3" tabindex="-1" value=""></div>
    <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
    </div>
</form>
</div>
`;

function Subscribe() {
  return (
    <div
      className={styles.subscribe}
      dangerouslySetInnerHTML={{ __html: embed }}
    />
  );
}

export default Subscribe;
