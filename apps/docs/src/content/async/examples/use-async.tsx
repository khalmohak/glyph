import { Async, Button, useAsync } from '@glyphui/ui'
import { useState } from 'react'

const projects = ['Website redesign', 'Billing v2', 'Mobile onboarding']

function fetchProjects(fail: boolean): Promise<string[]> {
  return new Promise((resolve, reject) =>
    setTimeout(
      () => (fail ? reject(new Error('The projects service timed out.')) : resolve(projects)),
      900,
    ),
  )
}

export default function Example() {
  const [fail, setFail] = useState(false)
  const result = useAsync(() => fetchProjects(fail), [fail])
  return (
    <div className="grid gap-3">
      <Button
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => setFail((f) => !f)}
      >
        {fail ? 'Load successfully' : 'Simulate an error'}
      </Button>
      <Async result={result}>
        {(items) => (
          <ul className="grid gap-1 text-small">
            {items.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </Async>
    </div>
  )
}
