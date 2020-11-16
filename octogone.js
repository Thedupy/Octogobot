class Octogone {
    constructor(_id, _fighter1, _fighter2, _idArene) {
        this.fighter1 = _fighter1;
        this.fighter2 = _fighter2;
        this.idArene = _idArene;
        this.areneName = "Arene Name";
        this.id = _id;
        this.turn = false;
    }

    changeTurn() {
        this.turn = !this.turn;
        console.log("Tour changé");
    }
}

module.exports = Octogone;