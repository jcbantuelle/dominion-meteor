Scholar = class Scholar extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard()

    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(7)
  }

}
