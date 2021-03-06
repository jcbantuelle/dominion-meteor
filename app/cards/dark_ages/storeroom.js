Storeroom = class Storeroom extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    _.each(['cards', 'coins'], (discard_type) => {
      if (_.size(player_cards.hand) > 0) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)

        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose any number of cards to discard for ${discard_type}:`,
          cards: player_cards.hand,
          minimum: 0,
          maximum: 0
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        let selected_cards = turn_event_processor.process(Storeroom.discard_cards)

        if (_.size(selected_cards) === 0) {
          game.log.push(`&nbsp;&nbsp;but does not discard anything`)
        } else {
          let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
          card_discarder.discard()

          if (discard_type === 'cards') {
            let card_drawer = new CardDrawer(game, player_cards)
            card_drawer.draw(_.size(selected_cards))
          } else if (discard_type === 'coins') {
            let coin_gainer = new CoinGainer(game, player_cards, card_player)
            coin_gainer.gain(_.size(selected_cards))
          }
        }
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
        return false
      }
    })
  }

  static discard_cards(game, player_cards, selected_cards) {
    return selected_cards
  }

}
