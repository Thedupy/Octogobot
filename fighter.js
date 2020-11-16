class Fighter {
    constructor(_fighterName, _idUser, _victory = 0) {
        this.fighterName = _fighterName;
        this.PV = 5;
        this.PvMax = this.PV;
        this.idUser = _idUser;
        this.victory = _victory;
    }
}

module.exports = Fighter;