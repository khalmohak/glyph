import { Prose } from '@glyphui/ui'

export default function Example() {
  return (
    <Prose asChild>
      <article>
        <h2>Why one theme file</h2>
        <p>
          Most design systems scatter decisions across config files, CSS variables and component
          props. Glyph keeps them in <code>glyph.theme.ts</code>, so a rebrand is{' '}
          <strong>one diff</strong>, not a migration.
        </p>
        <h3>What a theme controls</h3>
        <ul>
          <li>Color for light and dark mode</li>
          <li>A nine-step type scale with tracking and weight</li>
          <li>Radius, shadows, motion and control density</li>
        </ul>
        <blockquote>Good design is as little design as possible.</blockquote>
        <pre>
          <code>{"export default defineTheme({ name: 'acme', extends: presets.editorial })"}</code>
        </pre>
        <table>
          <thead>
            <tr>
              <th>Preset</th>
              <th>Character</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>glyph</td>
              <td>Precise, dark-first</td>
            </tr>
            <tr>
              <td>editorial</td>
              <td>Serif, warm paper</td>
            </tr>
          </tbody>
        </table>
        <p>
          Read the <a href="https://github.com/khalmohak/glyph">source on GitHub</a>.
        </p>
      </article>
    </Prose>
  )
}
