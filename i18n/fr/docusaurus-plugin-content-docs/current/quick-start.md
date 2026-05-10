---
id: quick-start
title: Démarrage rapide
sidebar_position: 1
toc_max_heading_level: 3
---

Développez et testez les appels API de votre jeu dans Unity sans attendre les services backend.

---

import VideoTimestamp from '@site/src/components/VideoTimestamp';
import CodeBlock from '@theme/CodeBlock';

## Vidéo

<iframe
  id="demo-video"
  width="560"
  height="315"
  src="https://www.youtube.com/embed/T5L8wV9waKk?enablejsapi=1"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
/>

---

## Le problème

Backend en retard ? Réseau instable ? Vous voulez travailler hors ligne ? Besoin de tester les erreurs ?

- Backend pas prêt → définissez vous-même le contrat API, construisez maintenant, basculez vers le vrai backend plus tard
- Besoin de tester les erreurs → configurez des réponses succès/erreur/timeout/invalides à la demande
- Développement hors ligne → jouez sans réseau, pas de VPN nécessaire
- Test de pagination → cycles automatiques à travers différentes réponses

Routez les appels API vers :
- Vrais backends (production, staging)
- Serveurs QA
- Localhost
- Réponses mockées (codes de statut personnalisés, latence, données)

![Routage API Mocking Toolkit](/img/diagram-amt-optimized.png)

---

## Installation

1. Ouvrez l'Unity Asset Store
2. Recherchez "API Mocking Toolkit" → `Import`
3. Importez tous les fichiers

**Prérequis :** Unity 2021.3+, aucune dépendance externe

---

## Scène de démo

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. Ouvrir la scène de démo</strong></td>
      <td><code>Assets &gt; CodeCarnage &gt; ApiMockingToolkit &gt; Samples &gt; DemoScene &gt; DemoScene.unity</code></td>
    </tr>
    <tr>
      <td><strong>2. Appuyer sur Play</strong></td>
      <td>La scène se charge avec deux boutons : <code>Get Users</code> et <code>Get Posts</code></td>
    </tr>
    <tr>
      <td><strong>3. Cliquer sur "Get Users"</strong></td>
      <td>Envoie une requête → le Toolkit l'intercepte → retourne des données mockées instantanément, sans internet</td>
    </tr>
    <tr>
      <td><strong>4. Cliquer plusieurs fois sur "Get Posts"</strong></td>
      <td>Cycle à travers les pages 1 → 2 → 3 → 1 (Stratégies de réponse en action)</td>
    </tr>
  </tbody>
</table>

---

## Comment ça marche

Ouvrez `DemoController.cs` :

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("{{baseUrl}}/users");
    DisplayResponse(response);
}
```

Appel API standard. `{{baseUrl}}` se résout selon l'environnement actif. Le Toolkit intercepte les URLs correspondantes et retourne vos données mockées. Pas de vérifications `if (testing)`. Le même code fonctionne avec les mocks ou les vrais backends.

---

## Créez votre premier endpoint

Mockez l'API de votre jeu en utilisant l'endpoint `/comments` de JSONPlaceholder comme exemple. Fonctionne hors ligne avec les mocks, ou en ligne en appelant la vraie API.

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. Ouvrir la fenêtre du toolkit</strong></td>
      <td><code>Window &gt; CodeCarnage &gt; API Mocking Toolkit</code></td>
    </tr>
    <tr>
      <td><strong>2. Créer un endpoint</strong></td>
      <td>
        Cliquez sur "+ Endpoint", définissez :
        <ul>
          <li><strong>Nom :</strong> <code>Create Comment</code></li>
          <li><strong>Méthode :</strong> <code>POST</code></li>
          <li><strong>URL :</strong> <code>https://jsonplaceholder.typicode.com/comments</code></li>
          <li><strong>Type de correspondance :</strong> <code>Exact</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>3. Ajouter une réponse mock</strong></td>
      <td>
        Code de statut : <code>201</code>
        <CodeBlock language="json">{`{
  "id": 501,
  "postId": 1,
  "name": "Demo comment from Unity",
  "email": "player@example.com",
  "body": "Returned from mock"
}`}</CodeBlock>
      </td>
    </tr>
    <tr>
      <td><strong>4. Activer le mode hors ligne</strong></td>
      <td>Activez le bouton en haut</td>
    </tr>
    <tr>
      <td><strong>5. Tester</strong></td>
      <td>
        <CodeBlock language="csharp">{`using System.Collections.Generic;
using UnityEngine;
using CodeCarnage.ApiMockingToolkit;

public class ProfileTest : MonoBehaviour
{
    async void Start()
    {
        var requestBody = "{\n  \"postId\": 1,\n  \"name\": \"Demo comment\",\n  \"email\": \"player@example.com\"\n}";
        var headers = new Dictionary<string, string> { { "Content-Type", "application/json" } };
        var response = await ApiClient.Post("https://jsonplaceholder.typicode.com/comments", requestBody, headers);
        Debug.Log($"Status: {response.StatusCode}");
    }
}`}</CodeBlock>
      </td>
    </tr>
  </tbody>
</table>

---

## Prochaines étapes

- [Fonctionnalités principales](/docs/core-features) – Stratégies de réponse, environnements, sessions, OpenAPI, simulation d'erreurs
- [Guides](/docs/guides) – Workflows réels
- [Référence de l'API](/docs/api-reference) – Surface API complète

---

## Dépannage

**Rien ne se passe ?** Vérifiez que le mode hors ligne est activé, que l'URL correspond exactement (sensible à la casse), consultez la Console pour les erreurs.

**La scène de démo ne fonctionne pas ?** Vérifiez que "Demo Scene Collection" est sélectionnée, réimportez les Samples depuis le Package Manager.

**Des questions ?** Consultez la [FAQ de dépannage](/docs/api-reference#dépannage) ou envoyez un email à `support@codecarnage.com`
