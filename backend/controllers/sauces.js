const Sauce = require("../models/sauces");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré" });
    })
    .catch((e) => {
      res.status(400).json({ e });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Objet modifié!" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((e) => res.status(404).json({ e }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((e) => res.status(400).json({ e }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
      switch (req.body.like) {
        case 1:
          sauce.usersLiked.push(req.auth.userId);
          sauce.likes = sauce.usersLiked.length;
          sauce.save();
          break;
        case 0:
          for (
            let i = 0;
            i < sauce.usersLiked.length || i < sauce.usersDisliked.length;
            i++
          ) {
            if (req.auth.userId === sauce.usersLiked[i]) {
              sauce.usersLiked.splice(i, 1);
              sauce.likes = sauce.usersLiked.length;
              sauce.save();
              break;
            } else req.auth.userId === sauce.usersDisliked[i];
            sauce.usersDisliked.splice(i, 1);
            sauce.dislikes = sauce.usersDisliked.length;
            sauce.save();
            break;
          }
          break;
        case -1:
          sauce.usersDisliked.push(req.auth.userId);
          sauce.dislikes = sauce.usersDisliked.length;
          sauce.save();
          break;
      }
    })
    .catch((error) => res.status(404).json({ error }));
};