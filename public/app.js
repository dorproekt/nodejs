function formatCurrency(){
    document.querySelectorAll('.price').forEach(node => {
        node.textContent = new Intl.NumberFormat('ua-UA', {
            currency: 'uah',
            style: 'currency'
        }).format(node.textContent)
    })
}

window.addEventListener('load', formatCurrency)

const $card = document.getElementById('card')

if($card){
    $card.addEventListener('click', event => {

        if(event.target.classList.contains('js-remove')){
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;

            fetch('/card/remove/' + id, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
              .then(card => {
                  if(card.courses.length){
                    const html = card.courses.map(c => {
                        return `
                            <tr>
                                <td>${c.title}</td>
                                <td>${c.count}</td>
                                <td>
                                    <button class="btn btn-small js-remove" data-id="${c.id}">Удалить</button>
                                </td>
                            </tr>
                        `
                    }).join('')

                    $card.querySelector('tbody').innerHTML = html
                    $card.querySelector('.price').innerHTML = card.price

                    formatCurrency()
                  }else{
                      $card.innerHTML = `<p>Корзина пуста</p>`
                  }
              })
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'));