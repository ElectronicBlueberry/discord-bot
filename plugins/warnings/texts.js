const settings = require('require-reload')('./settings.json');
const config = require("../../config.json");

exports.warning_help = () => {
	return `
Nutze "${config.prefix}${settings.command_warning} ${settings.command_warning_new} @Nutzername Mahnstufe"
um eine neue Mahnung zu erstellen.
`;
};

exports.warning_unsent = () => {
	return `
Es kann keine neue Mahnung erstellt werden, solange es noch eine offene gibt!
Versende die Mahnung mit "${config.prefix}${settings.command_warning} ${settings.command_warning_send}"
oder breche die Mahnung mit "${config.prefix}${settings.command_warning} ${settings.command_warning_cancel}" ab.
`;
};

exports.warning_new_nouser = () => {
	return `
Bitte nenne einen Nutzer in dem folgendem Format:
"${config.prefix}${settings.command_warning} ${settings.command_warning_new} @Nutzername Mahnstufe"
`;
};

exports.warning_new_sucess = (id, target, level) => {
	return `
Neue Mahnung erstellt von <@${id}> für Nutzer <@${target}> mit der Mahnstufe ${level}

Nutze jetzt
"${config.prefix}${settings.command_warning} ${settings.command_warning_content} [Inhalt der Mahnung]"
um die Mahnungsnachricht zu verfassen.
`;
};

exports.warning_none_open = () => {
	return `
Keine offene Mahnung!

Nutze "${config.prefix}${settings.command_warning} ${settings.command_warning_new} @Nutzername Mahnstufe"
um eine Mahnung zu erstellen.
`;
};

exports.warning_content_exists = () => {
	return `
Diese Mahnung hat bereits einen Inhalt.
Editiere die Nachricht oder breche die Mahnung mit
"${config.prefix}${settings.command_warning} ${settings.command_warning_cancel}"
ab und starte eine neue.
`;
};

exports.warning_content_sucess = () => {
	return `
Inhalt gesetzt.
Editiere die Nachricht, um den Inhalt der Mahnung zu ändern.

"${config.prefix}${settings.command_warning} ${settings.command_warning_approve}" um die Mahnung zu bestätigen.

"${config.prefix}${settings.command_warning} ${settings.command_warning_decline}" um ein Veto einzulegen.

"${config.prefix}${settings.command_warning} ${settings.command_warning_preview}" um eine Vorschau der Mahnung zu sehen.

"${config.prefix}${settings.command_warning} ${settings.command_warning_send}" um die Mahnung zu senden.

"${config.prefix}${settings.command_warning} ${settings.command_warning_setlevel} Mahnstufe" um die Mahnstufenerhöhung der Mahnung zu ändern.

Es werden ${settings.warning_approve_count} Bestätigungen benötigt, bevor die Mahnung gesendet werden kann.
`;
};

exports.warning_wrong_author = (author_id) => {
	return `Nur <@${author_id}> kann den Inhalt dieser Mahnung festlegen`;
};

exports.warning_cancel = ()  => {
	return `Mahnung abgebrochen!`;
}

exports.warning_declined = (member) => {
	return `<@${member.id}> hat die Mahnung abgelehnt`;
};

exports.warning_declined_allready = (member) => {
	return `<@${member.id}>, du hast diese Mahnung bereits abgelehnt!`;
};

exports.warning_approved = (member) => {
	return `<@${member.id}> hat die Mahnung genehmigt`;
};

exports.warning_approved_allready = (member) => {
	return `<@${member.id}>, du hast diese Mahnung bereits genehmigt!`;
};

exports.warning_vetoed = (vetos) => {
	let veto_members = ``;
	vetos.forEach(e => {veto_members += `<@${e}> \n`});

	return `
Die Mahnung konnte nicht gesendet werden, da sie von folgenden Personen abgelehnt wurde:

${veto_members}
Nutze "${config.prefix}${settings.command_warning} ${settings.command_warning_approve}",
um eine Ablehnung zurückzuziehen
`;
};

exports.warning_no_content = () => {
	return `Die Aktuelle Mahnung hat keinen Inhalt oder es ist keine Mahnung offen`;
};

exports.warning_insufficent_approves = (count) => {
	return `
Nicht genug Bestätigungen: ${count} von ${settings.warning_approve_count}

Nutze "${config.prefix}${settings.command_warning} ${settings.command_warning_approve}",
um die Mahnung zu bestätigen
`;
};

exports.warning_message = (content) => {
	return `
Du wurdest vom Modteam gemahnt.
Inhalt der Mahnung:
---------------------------
${content}
---------------------------
Bitte nicht auf diese Nachricht antworten.
`;
};

exports.warning_sent = () => {
	return `Mahnung gesendet`;
};

exports.warning_archive = (author, target, content, approves, level, new_level) => {
	let now = new Date();
	let approve_members = ``;

	approves.forEach(m => {approve_members += `<@${m}>\n`});

	return `
---  ${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}  ---

Mahnung an: <@${target}>
Mahnstufe: +${level}
Gesamte Mahnstufe: ${new_level}

Erstellt von: <@${author}>
Genehmigt von:
${approve_members}
------ Inhalt ------

${content}

------ ------ ------
`;
};

exports.warning_setlevel = (level) => {
	return `Stufe der Mahnung auf ${level} geändert`;
}

exports.level_increase = (target, level) => {
	return `Mahnstufe von <@${target}> auf ${level} erhöht`;
};

exports.level_reset = (target) => {
	return `Mahnstufe von <@${target}> auf 0 zurückgesetzt`;
};

exports.level_get = (target, level) => {
	return `Mahnstufe von <@${target}> ist ${level}`;
};

exports.level_help = () => {
	return `
Folgende Befehle sind für "${config.prefix}${settings.command_level}" verfügbar:

"${config.prefix}${settings.command_level} @Nutzername" fragt die Mahnstufe ab

"${config.prefix}${settings.command_level} ${settings.command_level_add} @Nutzername Mahnstufe" erhöht die Mahnstufe

"${config.prefix}${settings.command_level} ${settings.command_level_reset} @Nutzername" setzt die Mahnstufe auf 0 zurück
`;
};

exports.level_nouser = () => {
	return `
Nenne ein Mitglied. Beispiel:

"${config.prefix}${settings.command_level} ${settings.command_level_add} @Nutzername Mahnstufe"
`;
};

exports.level_archive_increase = (author, target, level, new_level) => {
	return `<@${author}> hat die Mahnstufe von <@${target}> von ${level} auf ${new_level} erhöht`;
};

exports.level_archive_reset = (author, target, level) => {
	return `<@${author}> hat die Mahnstufe von <@${target}> von ${level} auf 0 zurückgesetzt`;
};

exports.no_user_found = (user) => {
	return `Kein Nutzer namens ${user} gefunden`;
}