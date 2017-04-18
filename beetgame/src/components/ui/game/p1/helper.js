var Handlebars = require('handlebars-template-loader/runtime');

Handlebars.registerHelper('getPlayerRoleIcon', function(value){
    var dict = {
        up: 'role-icon-t',
        adc: 'role-icon-adc',
        mid: 'role-icon-m',
        wild: 'role-icon-y',
        assis: 'role-icon-f'
    };
    var html = '<div class="player-role"><span class="' + dict[value] + '"></span></div>';
	return html += html;
});

Handlebars.registerHelper('togglePlusAndMinusIcon', function(value, options){
    var roleName = options.data._parent.key;
    if (options.data.root.choosen[roleName].playerid == value) {
        return '<span class="card-icon-minus"></span>';
    } else {
        return '<span class="card-icon-plus"></span>';
    }
});