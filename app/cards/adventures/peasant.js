Peasant = class Peasant extends Traveller {

  types() {
    return ['action', 'traveller']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)
  }

  discard_event(discarder, peasant) {
    this.choose_exchange(discarder.game, discarder.player_cards, peasant, 'Soldier')
  }

}
