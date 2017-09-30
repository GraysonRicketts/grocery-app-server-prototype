import db from './../models/'


const basketController = {}

basketController.get = (req, res) => {
    db.Basket
        .findById(req.user._basket).exec()
        .populate({
            path: '_items._item',
            model: 'Item',
            select: 'title category brand description'
        })
        .then((basket) => {
            res.status(200).json({
                basket: basket
            })
        })
        .catch((err) => {
            res.status(500).json({
                message: err
            })
        })
}

basketController.post = (req, res) => {
    // TODO: Validate newItems
    const newItems = req.body

    db.Basket
        .findById(req.user._basket).exec()
        .then((basket) => {
            try {
                const badUpdates = updateBasket(basket, newItems)
            }
            catch (err) {
                res.status(500).json({
                    message: 'Failed to update basket: ' + err.message
                })
            }

            basket.markModified('_items')
            basket
                .save((err) => {
                    if (err) {
                        res.status(500).json({
                            message: 'Failed to save updates: ' + err.message
                        })
                    }
                })

            
            res.status(200).json({
                success: true
            })
        }).catch((err) => {
            res.status(500).json({
                err
            })
        })
}

// TODO: Add route to remove items from basket

function updateBasket(basket, newItems) {
    basket._items.forEach((item, index) => {
        const itemId = item._item.toString()
        
        // Update existing items
        if (itemId in newItems) { 
            for (let field in newItems[itemId]) {
                basket._items[index][field] = newItems[itemId][field]
            }

            delete newItems[itemId]
        }
    }, this)

    // Add new items
    for (let itemId in newItems) {
        let tempItem = {}

        tempItem._item = itemId
        for (let field in newItems[itemId]) {
            tempItem[field] = newItems[itemId][field]
        }

        basket._items.push(new db.BasketItem(tempItem))
    }
}

export default basketController