CardMover = class CardMover {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  move(source, destination, card, destination_index = 0) {
    let card_index = _.findIndex(source, function(source_card) {
      return source_card.id === card.id
    })
    if (card_index !== -1) {
      source.splice(card_index, 1)
      destination.splice(destination_index, 0, card)
    }
  }

}