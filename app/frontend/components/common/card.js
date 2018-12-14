const {h, Component} = require('preact')

class Card extends Component {
  render({children, tabs, activeTab, onTabChange}) {
    return h(
      'div',
      {class: 'card'},
      tabs &&
        h(
          'div',
          {class: 'card-tabs'},
          tabs.map(({key, name}) =>
            h(
              'div',
              {
                class: `card-tab ${activeTab === key ? 'active' : ''}`,
                onClick: () => onTabChange(key),
              },
              h('span', {}, name),
            ),
          ),
        ),
      h(
        'div',
        {class: 'card-body'},
        tabs ? tabs.filter((x) => x.key === activeTab)[0].content : children,
      ),
    )
  }
}

module.exports = Card
