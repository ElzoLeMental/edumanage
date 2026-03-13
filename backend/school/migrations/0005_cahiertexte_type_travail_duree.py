from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('school', '0004_cahier_texte_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='cahiertexte',
            name='type_travail',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('exercice', 'Exercice'), ('lecture', 'Lecture'),
                    ('lecon', 'Leçon à apprendre'), ('expose', 'Exposé'),
                    ('recherche', 'Recherche'), ('dm', 'Devoir maison'), ('autre', 'Autre'),
                ],
                blank=True,
            ),
        ),
        migrations.AddField(
            model_name='cahiertexte',
            name='duree_estimee',
            field=models.CharField(
                max_length=10,
                choices=[
                    ('15min', '15 min'), ('30min', '30 min'), ('45min', '45 min'),
                    ('1h', '1 h'), ('1h30', '1 h 30'), ('2h', '2 h'), ('2h+', 'Plus de 2 h'),
                ],
                blank=True,
            ),
        ),
    ]
