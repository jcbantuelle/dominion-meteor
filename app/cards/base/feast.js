Feast = class Feast extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_trasher = new CardTrasher(game, player_cards.username, player_cards.in_play, 'Feast');
    [game, player_cards.in_play] = card_trasher.trash()

    let eligible_cards = _.filter(game.kingdom_cards.concat(game.common_cards), function(card) {
      return card.count > 0 && card.top_card.coin_cost <= 5 && card.top_card.potion_cost === 0
    })

    if (_.size(eligible_cards) > 0) {
      Games.update(game._id, game)
      PlayerCards.update(player_cards._id, player_cards)
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1,
        finished: false
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(this.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      Games.update(game._id, game)
      PlayerCards.update(player_cards._id, player_cards)
    }
  }

  gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards.username, player_cards.discard, selected_card.name);
    [game, player_cards.discard] = card_gainer[`gain_${selected_card.source}_card`]()
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
