Diadem = class Diadem extends Card {

  types() {
    return ['treasure', 'prize']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2 + game.turn.actions)
  }

}
